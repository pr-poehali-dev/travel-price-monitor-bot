import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send tour deals to Telegram chat/group with formatted message
    Args: event with httpMethod, body containing deal info; context with request_id
    Returns: HTTP response with send status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if not bot_token or not chat_id:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Telegram credentials not configured'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        deal = body_data.get('deal', {})
        
        destination = deal.get('destination', 'Неизвестно')
        current_price = deal.get('currentPrice', 0)
        original_price = deal.get('originalPrice', 0)
        discount = deal.get('discount', 0)
        url = deal.get('url', '')
        
        message = f'''🔥 ГОРЯЩИЙ ТУР! Скидка {discount}%

📍 Направление: {destination}

💰 Цена сейчас: {current_price}$
💸 Была: {original_price}$
🎯 Экономия: {discount}% OFF

🔗 Забронировать: {url}

⏰ Найдено: только что'''
        
        telegram_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        
        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML',
            'disable_web_page_preview': False
        }).encode('utf-8')
        
        req = urllib.request.Request(telegram_url, data=data, method='POST')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        try:
            with urllib.request.urlopen(req) as response:
                response_data = response.read().decode('utf-8')
                telegram_response = json.loads(response_data)
                
                if telegram_response.get('ok'):
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'success': True,
                            'message': 'Deal sent to Telegram',
                            'messageId': telegram_response.get('result', {}).get('message_id')
                        })
                    }
                else:
                    return {
                        'statusCode': 500,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'error': 'Telegram API error',
                            'details': telegram_response
                        })
                    }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to send message',
                    'details': str(e)
                })
            }
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'status': 'Bot is running',
                'configured': bool(os.environ.get('TELEGRAM_BOT_TOKEN') and os.environ.get('TELEGRAM_CHAT_ID'))
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
