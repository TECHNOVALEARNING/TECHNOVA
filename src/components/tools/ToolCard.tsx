import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Tag, Star } from "lucide-react";
import { Tool } from "@/data/toolsData";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 overflow-hidden">
      {/* Popular Badge */}
      {tool.isPopular && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-10">
          <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-current" /> TOP
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-white p-1.5 sm:p-2 border border-border/50 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src={tool.logo} 
              alt={`${tool.name} logo`} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f1f5f9/94a3b8?text=" + tool.name.charAt(0);
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
              {tool.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1 hidden sm:flex">
              {tool.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal bg-secondary/50">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6">
          {tool.description}
        </p>
      </div>

      <div className="pt-3 sm:pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
        {tool.promoCode ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {tool.discount}
            </span>
            <code className="text-xs font-bold px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">
              {tool.promoCode}
            </code>
          </div>
        ) : (
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            Outil gratuit / Freemium
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors ml-2" 
          asChild
        >
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
