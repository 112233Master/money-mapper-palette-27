
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
      card: "border-l-4 border-primary bg-primary/5",
      icon: "bg-primary/20 text-primary"
    },
    green: {
      card: "border-l-4 border-finance-deposit bg-finance-deposit/5",
      icon: "bg-finance-deposit/20 text-finance-deposit"
    },
    red: {
      card: "border-l-4 border-finance-withdrawal bg-finance-withdrawal/5",
      icon: "bg-finance-withdrawal/20 text-finance-withdrawal"
    },
    purple: {
      card: "border-l-4 border-finance-balance bg-finance-balance/5",
      icon: "bg-finance-balance/20 text-finance-balance"
    },
    amber: {
      card: "border-l-4 border-finance-petty bg-finance-petty/5",
      icon: "bg-finance-petty/20 text-finance-petty"
    },
    blue: {
      card: "border-l-4 border-blue-500 bg-blue-500/5",
      icon: "bg-blue-500/20 text-blue-500"
    },
    pink: {
      card: "border-l-4 border-pink-500 bg-pink-500/5",
      icon: "bg-pink-500/20 text-pink-500"
    },
    teal: {
      card: "border-l-4 border-teal-500 bg-teal-500/5",
      icon: "bg-teal-500/20 text-teal-500"
    },
    orange: {
      card: "border-l-4 border-orange-500 bg-orange-500/5",
      icon: "bg-orange-500/20 text-orange-500"
    },
    indigo: {
      card: "border-l-4 border-indigo-500 bg-indigo-500/5",
      icon: "bg-indigo-500/20 text-indigo-500"
    }
  };

  const selectedStyle = colorStyles[colorStyle];

  return (
    <Card className={cn(
      "overflow-hidden transition-all-200 hover:card-shadow-hover", 
      selectedStyle.card,
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-medium ${colorStyle !== 'default' ? 'text-foreground' : 'text-muted-foreground'}`}>
            {title}
          </CardTitle>
          {Icon && (
            <div className={cn("p-2 rounded-md", selectedStyle.icon, iconClassName)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium flex items-center",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
