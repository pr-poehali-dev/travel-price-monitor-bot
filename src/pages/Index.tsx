import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface TourDeal {
  id: string;
  destination: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  url: string;
}

const Index = () => {
  const { toast } = useToast();
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [deals, setDeals] = useState<TourDeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const PARSER_URL = 'https://functions.poehali.dev/000d078f-36fa-4ed8-8f6b-33f3e5c466db';
  const BOT_URL = 'https://functions.poehali.dev/8f41cdf2-03fb-4eae-9e68-a673d710285c';

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(PARSER_URL);
      const data = await response.json();
      setDeals(data.deals || []);
      setLastCheck(new Date());
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить туры',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseNewDeals = async () => {
    setIsParsing(true);
    try {
      const response = await fetch(PARSER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      toast({
        title: 'Парсинг завершен',
        description: `Найдено туров: ${data.count}`
      });
      
      await loadDeals();
    } catch (error) {
      toast({
        title: 'Ошибка парсинга',
        description: 'Не удалось спарсить туры',
        variant: 'destructive'
      });
    } finally {
      setIsParsing(false);
    }
  };

  const sendToTelegram = async (deal: TourDeal) => {
    try {
      const response = await fetch(BOT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Отправлено!',
          description: `Тур "${deal.destination}" отправлен в Telegram`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить в Telegram',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка отправки',
        description: 'Проверьте настройки Telegram бота',
        variant: 'destructive'
      });
    }
  };

  const sendAllToTelegram = async () => {
    for (const deal of deals) {
      await sendToTelegram(deal);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  useEffect(() => {
    loadDeals();
    
    const interval = setInterval(() => {
      parseNewDeals();
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Send" className="text-primary" size={32} />
            <h1 className="text-4xl font-bold text-primary">TRAVEL DEALS MONITOR</h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium">
            Горячие туры и скидки 50%+
          </p>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>Актуально на {formatDate(lastCheck)}: {formatTime(lastCheck)} (Обновляется каждые 10 минут)</span>
        </div>

        <div className="mb-6 flex gap-3">
          <button 
            onClick={parseNewDeals}
            disabled={isParsing}
            className="bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Icon name="RefreshCw" size={16} className={isParsing ? 'animate-spin inline mr-2' : 'inline mr-2'} />
            {isParsing ? 'Парсинг...' : 'Спарсить туры'}
          </button>
          
          <button 
            onClick={sendAllToTelegram}
            disabled={deals.length === 0}
            className="bg-accent text-white font-semibold py-3 px-6 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Icon name="Send" size={16} className="inline mr-2" />
            Отправить все в Telegram
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Загрузка туров...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">Горящие туры не найдены</p>
            <button 
              onClick={parseNewDeals}
              className="bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Запустить парсинг
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <Card 
                key={deal.id} 
                className="overflow-hidden bg-white border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <Icon name="Send" size={14} className="text-primary" />
                    <span className="text-xs font-medium text-primary">Направление</span>
                  </div>
                  <img 
                    src={deal.imageUrl} 
                    alt={deal.destination}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {deal.destination}
                  </h3>

                  <div className="bg-primary rounded-2xl p-5 mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-white/80 text-sm font-medium mb-1">
                          Цена тура
                        </div>
                        <div className="text-4xl font-bold text-white">
                          {deal.currentPrice}$
                        </div>
                      </div>
                      <Badge className="bg-accent text-white border-none font-semibold px-3 py-1.5 text-sm">
                        {deal.discount}% OFF
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Icon name="Plane" size={16} className="text-white/60" />
                      <span className="text-white/80 text-xs">Было</span>
                      <span className="text-white/60 line-through text-sm ml-auto">
                        {deal.originalPrice}$
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <button className="w-full bg-white border-2 border-accent text-accent font-semibold py-3 px-4 rounded-xl hover:bg-accent hover:text-white transition-colors duration-300">
                        Открыть
                      </button>
                    </a>
                    <button 
                      onClick={() => sendToTelegram(deal)}
                      className="bg-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors"
                      title="Отправить в Telegram"
                    >
                      <Icon name="Send" size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
