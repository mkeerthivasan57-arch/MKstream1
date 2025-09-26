<?php
/**
 * MKstream — All-in-One Auto SEO Engine
 * - DB driven meta, OG, Twitter, JSON-LD (series/episodes/categories)
 * - Auto sitemap.xml (homepage, categories, series, episodes)
 * - Auto ping: Google, Bing, IndexNow
 * - Auto OG image generator + caching (GD)
 * - Robots.txt writer
 * - Minify output & send caching headers
 *
 * USAGE:
 * 1. Edit CONFIG below (DB credentials, DOMAIN, INDEXNOW_KEY).
 * 2. Include this file at top of your page templates BEFORE any output:
 *      require_once __DIR__ . '/seo_engine.php';
 * 3. For episode page supply ?episode_id=###, for series ?series_id=###, for category ?category_id=###
 * 4. Ensure writable folders: /seo_cache (for og images, sitemap)
 *
 * SECURITY: Use HTTPS, set proper DB credentials, protect indexnow key.
 */

#########################
# CONFIG
#########################
define('MK_DB_DSN', 'mysql:host=localhost;dbname=mkstream;charset=utf8mb4'); // edit
define('MK_DB_USER', 'db_user'); // edit
define('MK_DB_PASS', 'db_pass'); // edit
define('MK_DOMAIN', 'https://yourdomain.com'); // edit (no trailing slash)
define('MK_INDEXNOW_KEY', 'YOUR_INDEXNOW_KEY'); // edit (optional)
define('MK_CACHE_DIR', __DIR__ . '/seo_cache'); // must be writable
define('MK_OG_DIR', MK_CACHE_DIR . '/og'); // must be writable
define('MK_SITEMAP_FILE', MK_CACHE_DIR . '/sitemap.xml');
define('MK_ROBOTS_FILE', __DIR__ . '/robots.txt'); // will be written automatically
define('MK_OG_FONT', __DIR__ . '/fonts/Inter-Regular.ttf'); // optional: path to TTF font for OG text
@mkdir(MK_CACHE_DIR, 0755, true);
@mkdir(MK_OG_DIR, 0755, true);

#########################
# DB CONNECT
#########################
try {
    $pdo = new PDO(MK_DB_DSN, MK_DB_USER, MK_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Exception $e) {
    // Fail silently but output minimal fallback meta to avoid breaking the site
    error_log('SEO Engine DB error: ' . $e->getMessage());
    function seo_minimal_meta() {
        echo "<title>MKstream</title>\n<meta name='robots' content='index, follow'>";
    }
    seo_minimal_meta();
    return;
}

#########################
# Helper: slugify
#########################
function mk_slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text) ?: $text;
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return $text ?: 'n-a';
}

#########################
# Helper: safe esc
#########################
function mk_esc($s){ return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

#########################
# OG image generator (GD)
# Generates a share image with thumbnail + title overlay, caches to MK_OG_DIR
#########################
function mk_generate_og_image($slug, $title, $thumb_url = null) {
    $cacheFile = MK_OG_DIR . "/{$slug}.png";
    // If cache exists and recent (7 days) return it
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 7*24*3600)) {
        return $cacheFile;
    }

    // Image size for OG (1200x630)
    $w = 1200; $h = 630;
    $img = imagecreatetruecolor($w, $h);
    imagesavealpha($img, true);
    $bg = imagecolorallocatealpha($img, 0, 0, 0, 0);
    imagefill($img, 0, 0, $bg);

    // Try to load thumbnail into GD; fallback to gradient + dark overlay
    $thumb = null;
    if ($thumb_url) {
        // support local/path or remote
        $thumb_contents = @file_get_contents($thumb_url);
        if ($thumb_contents) {
            // create from string
            $thumb = @imagecreatefromstring($thumb_contents);
        }
    }

    if ($thumb) {
        // resize/crop center to fill
        $tw = imagesx($thumb); $th = imagesy($thumb);
        // scale to cover
        $scale = max($w/$tw, $h/$th);
        $nw = intval($tw * $scale); $nh = intval($th * $scale);
        $tmp = imagecreatetruecolor($nw, $nh);
        imagecopyresampled($tmp, $thumb, 0,0,0,0, $nw,$nh, $tw,$th);
        // copy center
        $cx = intval(($nw - $w)/2); $cy = intval(($nh - $h)/2);
        imagecopy($img, $tmp, 0,0, $cx,$cy, $w,$h);
        imagedestroy($tmp);
        imagedestroy($thumb);
    } else {
        // Draw gradient background
        for ($y=0; $y<$h; $y++) {
            $r = intval(10 + ($y/$h)*40);
            $g = intval(25 + ($y/$h)*40);
            $b = intval(60 + ($y/$h)*40);
            $col = imagecolorallocate($img, $r,$g,$b);
            imageline($img, 0, $y, $w, $y, $col);
        }
    }

    // Dark overlay for readable text
    $overlay = imagecolorallocatealpha($img, 0,0,0,60); // alpha 0-127 (127 transparent)
    imagefilledrectangle($img, 0, 0, $w, $h, $overlay);

    // Add series title text
    $title_text = mb_strtoupper($title, 'UTF-8');
    $font = (file_exists(MK_OG_FONT) ? MK_OG_FONT : null);

    // Choose font size by title length
    $fontSize = ($font ? 36 : 30);
    $angle = 0;
    $color = imagecolorallocate($img, 255, 255, 255);

    if ($font) {
        // wrap text to multiple lines
        $maxWidth = $w - 120;
        $words = preg_split('/\s+/', $title_text);
        $lines = []; $line = '';
        foreach ($words as $word) {
            $try = trim($line ? ($line . ' ' . $word) : $word);
            $box = imagettfbbox($fontSize, $angle, $font, $try);
            $tw = abs($box[2] - $box[0]);
            if ($tw > $maxWidth) {
                if ($line) { $lines[] = $line; $line = $word; } else { $lines[] = $try; $line = ''; }
            } else $line = $try;
        }
        if ($line) $lines[] = $line;

        # ... (truncated in this message for brevity; full code will be written)