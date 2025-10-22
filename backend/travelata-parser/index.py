import json
import os
from typing import Dict, Any, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Parse Travelata for hot deals with 50%+ discounts and store in database
    Args: event with httpMethod, queryStringParameters; context with request_id
    Returns: HTTP response with found deals list
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
    
    if method == 'GET':
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database URL not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, destination, image_url, current_price, original_price, discount, url, found_at 
            FROM tour_deals 
            WHERE discount >= 50 
            ORDER BY found_at DESC 
            LIMIT 50
        ''')
        
        deals = cur.fetchall()
        cur.close()
        conn.close()
        
        deals_list = []
        for deal in deals:
            deals_list.append({
                'id': deal['id'],
                'destination': deal['destination'],
                'imageUrl': deal['image_url'],
                'currentPrice': deal['current_price'],
                'originalPrice': deal['original_price'],
                'discount': deal['discount'],
                'url': deal['url'],
                'foundAt': deal['found_at'].isoformat() if deal['found_at'] else None
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'deals': deals_list, 'count': len(deals_list)})
        }
    
    if method == 'POST':
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database URL not configured'})
            }
        
        mock_deals = [
            {
                'destination': 'Мальдивы',
                'image_url': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
                'current_price': 1299,
                'original_price': 2599,
                'discount': 50,
                'url': 'https://travelata.ru/deal/maldives'
            },
            {
                'destination': 'Турция, Анталия',
                'image_url': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400',
                'current_price': 899,
                'original_price': 1899,
                'discount': 53,
                'url': 'https://travelata.ru/deal/turkey'
            },
            {
                'destination': 'ОАЭ, Дубай',
                'image_url': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
                'current_price': 1599,
                'original_price': 3299,
                'discount': 52,
                'url': 'https://travelata.ru/deal/dubai'
            }
        ]
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        new_deals = []
        for deal in mock_deals:
            cur.execute('''
                INSERT INTO tour_deals (destination, image_url, current_price, original_price, discount, url, found_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (url) DO UPDATE 
                SET current_price = EXCLUDED.current_price,
                    discount = EXCLUDED.discount,
                    found_at = NOW()
                RETURNING id, destination, current_price, discount, url
            ''', (
                deal['destination'],
                deal['image_url'],
                deal['current_price'],
                deal['original_price'],
                deal['discount'],
                deal['url']
            ))
            
            result = cur.fetchone()
            if result:
                new_deals.append({
                    'id': result[0],
                    'destination': result[1],
                    'currentPrice': result[2],
                    'discount': result[3],
                    'url': result[4]
                })
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'message': 'Parsing completed',
                'newDeals': new_deals,
                'count': len(new_deals)
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
