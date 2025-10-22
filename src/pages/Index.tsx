import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [deals, setDeals] = useState<TourDeal[]>([
    {
      id: '1',
      destination: 'Мальдивы',
      imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
      currentPrice: 1299,
      originalPrice: 2599,
      discount: 50,
      url: 'https://travelata.ru/deal/1'
    },
    {
      id: '2',
      destination: 'Турция, Анталия',
      imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400',
      currentPrice: 899,
      originalPrice: 1899,
      discount: 53,
      url: 'https://travelata.ru/deal/2'
    },
    {
      id: '3',
      destination: 'ОАЭ, Дубай',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
      currentPrice: 1599,
      originalPrice: 3299,
      discount: 52,
      url: 'https://travelata.ru/deal/3'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date());
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
                        Tour Deal Card Campionts
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
                    <span className="text-white/80 text-xs">Smaller Original Price</span>
                    <span className="text-white/60 line-through text-sm ml-auto">
                      {deal.originalPrice}$
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/20 rounded-xl p-4 mb-4">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Oriscolues Price
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    25₽9₽$
                  </div>
                </div>

                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <button className="w-full bg-white border-2 border-accent text-accent font-semibold py-3 px-6 rounded-xl hover:bg-accent hover:text-white transition-colors duration-300">
                    View Hot Deal
                  </button>
                </a>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="inline-flex items-center gap-3 bg-white border-2 border-primary text-primary font-semibold py-4 px-8 rounded-xl hover:bg-primary hover:text-white transition-colors duration-300 shadow-md">
            <Icon name="Send" size={20} />
            Notify via Telegram
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
