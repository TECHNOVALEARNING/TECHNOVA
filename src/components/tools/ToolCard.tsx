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
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/50 overflow-hidden h-full">
      {/* Featured Badge */}
      {tool.isFeatured && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-20 shadow-sm">
          <Star className="w-3 h-3 fill-current" /> TOP
        </div>
      )}

      {/* Cover Image Header */}
      <div className="relative h-32 w-full bg-muted/30 overflow-hidden">
        {tool.coverImageUrl ? (
          <img 
            src={tool.coverImageUrl} 
            alt={`Couverture de ${tool.name}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-background transition-opacity duration-500 opacity-80 group-hover:opacity-100" />
        )}
        
        {/* Glassmorphism gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Logo floating inside header */}
        <div className="absolute bottom-[-16px] left-4 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-2 border border-border/50 shadow-md flex items-center justify-center shrink-0 overflow-hidden z-10 transition-transform group-hover:-translate-y-1">
          <img 
            src={tool.logoUrl} 
            alt={`${tool.name} logo`} 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f1f5f9/94a3b8?text=" + tool.name.charAt(0);
            }}
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-6 pb-2 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-sm sm:text-lg text-card-foreground group-hover:text-primary transition-colors leading-tight">
            {tool.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {tool.categories.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 font-normal bg-secondary/50">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {tool.description}
        </p>

        <div className="space-y-3 mt-auto">
          {tool.promoCode && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-2 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-primary font-medium">
                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="line-clamp-1">{tool.discount || "Code Promo"}</span>
              </div>
              <code className="bg-white dark:bg-black px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold text-foreground border shadow-sm break-all">
                {tool.promoCode}
              </code>
            </div>
          )}

          <Button 
            asChild 
            className="w-full gap-1.5 sm:gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all h-8 sm:h-10 text-xs sm:text-sm px-2" 
            variant={tool.isFeatured ? "default" : "outline"}
          >
            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
              <span className="truncate">Visiter le site</span> <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
