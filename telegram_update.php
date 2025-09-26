<?php
$data = json_decode(file_get_contents('php://input'), true);
if(!$data || empty($data['api']) || empty($data['chat']) || empty($data['text'])) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'missing']); exit; }
$api = $data['api']; $chat = $data['chat']; $text = $data['text'];
$payload = json_encode(['chat_id'=>$chat, 'text'=>$text, 'parse_mode'=>'HTML']);
$ch = curl_init("https://api.telegram.org/bot{$api}/sendMessage");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$res = curl_exec($ch); curl_close($ch);
echo $res;
?>