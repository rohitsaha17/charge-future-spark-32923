import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_TESTIMONIALS as SITE_DEFAULT_TESTIMONIALS } from "@/lib/siteDefaults";

interface Testimonial {
  name: string;
  role: string;
  image: string;
  rating: number;
  review: string;
  location: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = SITE_DEFAULT_TESTIMONIALS.map((t) => ({
  name: t.name,
  role: t.role,
  image: t.fallbackImage,
  rating: t.rating,
  review: t.review,
  location: t.location,
}));

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('visible', true)
        .order('sort_order');
      if (data && data.length) {
        setTestimonials(
          data.map((r: any) => ({
            name: r.name,
            role: r.role || '',
            image: r.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name)}`,
            rating: r.rating || 5,
            review: r.review,
            location: r.location || '',
          }))
        );
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="glass-card p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex flex-col h-full">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4 group-hover:text-primary/40 transition-colors" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review */}
                  <p className="text-foreground/90 mb-6 flex-grow text-sm leading-relaxed">
                    "{testimonial.review}"
                  </p>

                  {/* Customer Info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-primary/70 mt-1">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default TestimonialsCarousel;
