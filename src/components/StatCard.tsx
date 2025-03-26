
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  colorStyle?: "default" | "green" | "red" | "purple" | "amber" | "blue" | "pink" | "teal" | "orange" | "indigo";
}

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('PKR', 'Rs. ');
  }
  return value.toString();
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
  colorStyle = "default",
}) => {
  // Define color styles for different card types
  const colorStyles = {
    default: {
      card: "bg-primary text-primary-foreground",
      icon: "bg-white/20 text-white"
    },
    green: {
      card: "bg-gradient-to-br from-green-400 to-green-600 text-white",
      icon: "bg-white/20 text-white"
    },
    red: {
      card: "bg-gradient-to-br from-rose-400 to-rose-600 text-white",
      icon: "bg-white/20 text-white"
    },
    purple: {
      card: "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
      icon: "bg-white/20 text-white"
    },
    amber: {
      card: "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
      icon: "bg-white/20 text-white"
    },
    blue: {
      card: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
      icon: "bg-white/20 text-white"
    },
    pink: {
      card: "bg-gradient-to-br from-pink-400 to-pink-600 text-white",
      icon: "bg-white/20 text-white"
    },
    teal: {
      card: "bg-gradient-to-br from-teal-400 to-teal-600 text-white",
      icon: "bg-white/20 text-white"
    },
    orange: {
      card: "bg-gradient-to-br from-orange-400 to-orange-600 text-white",
      icon: "bg-white/20 text-white"
    },
    indigo: {
      card: "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white",
      icon: "bg-white/20 text-white"
    }
  };

  const selectedStyle = colorStyles[colorStyle];

  return (
    <Card className={cn(
      "overflow-hidden rounded-xl transition-all duration-200 hover:shadow-lg", 
      selectedStyle.card,
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white/90">
            {title}
          </CardTitle>
          {Icon && (
            <div className={cn("p-2 rounded-full", selectedStyle.icon, iconClassName)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {formatValue(value)}
        </div>
        {description && (
          <p className="text-xs text-white/70 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-4">
            <span
              className={cn(
                "text-sm font-medium flex items-center",
                trend.isPositive ? "text-white" : "text-white"
              )}
            >
              {trend.isPositive ? "Increased by " : "Decreased by "}{trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
