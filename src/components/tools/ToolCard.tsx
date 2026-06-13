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
      {tool.isFeatured && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-current" /> TOP
        </div>
      )}

      <div>
        <div className="flex flex-col min-[450px]:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-white p-1.5 sm:p-2 border border-border/50 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src={tool.logoUrl} 
              alt={`${tool.name} logo`} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f1f5f9/94a3b8?text=" + tool.name.charAt(0);
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-lg text-card-foreground group-hover:text-primary transition-colors leading-tight">
              {tool.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tool.categories.slice(0, 1).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 font-normal bg-secondary/50">
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
  );
}
