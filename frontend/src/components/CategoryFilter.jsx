import { Badge } from "./ui/badge";
import {
  Sparkles,
  BookOpen,
  Laptop,
  Shirt,
  Home,
  Palette,
  Dumbbell,
  Briefcase,
  MoreHorizontal,
} from "lucide-react";

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  const categories = [
    { id: "all",                label: "All",               icon: Sparkles       },
    { id: "Study Material",     label: "Study Material",    icon: BookOpen       },
    { id: "Electronics",        label: "Electronics",       icon: Laptop         },
    { id: "Fashion",            label: "Fashion",           icon: Shirt          },
    { id: "Hostel Essentials",  label: "Hostel Essentials", icon: Home           },
    { id: "Handmade",           label: "Handmade",          icon: Palette        },
    { id: "Sports",             label: "Sports",            icon: Dumbbell       },
    { id: "Services",           label: "Services",          icon: Briefcase      },
    { id: "Other",              label: "Other",             icon: MoreHorizontal },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;

        return (
          <Badge
            key={category.id}
            variant={isActive ? "default" : "outline"}
            className={`cursor-pointer px-4 py-3 gap-2 rounded-full transition-all ${
              isActive
                ? "bg-primary hover:bg-primary/90 text-white"
                : "hover:bg-background"
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <Icon className="h-3.5 w-3.5" />
            {category.label}
          </Badge>
        );
      })}
    </div>
  );
}