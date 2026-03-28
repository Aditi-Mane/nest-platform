"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs"; // ✅ FIXED IMPORT

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────
function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      className={cn("w-full", className)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────
// LIST
// ─────────────────────────────────────────
function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex w-full bg-muted p-1 rounded-xl",
        className
      )}
      {...props}
    />
  );
}

// ─────────────────────────────────────────
// TRIGGER
// ─────────────────────────────────────────
function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "text-muted-foreground hover:text-foreground",
        "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

// ─────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────
function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-4 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };