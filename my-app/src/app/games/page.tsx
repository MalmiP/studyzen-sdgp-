"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Game {
  id: string;
  title: string;
  description: string;
  bgImage: string;
}

const games: Game[] = [
  {
    id: "memory",
    title: "Memory Game",
    description: "Test your memory by matching pairs of cards.",
    bgImage: "/images/memory.jpg",
  },
  {
    id: "simon",
    title: "Simon Says",
    description: "Watch the pattern and repeat it! A fun test of short-term memory.",
    bgImage: "/images/simonsays.png",
  },
  // Add more games if desired
];

export default function GamesIndex() {
  return (
    <div
      className="p-6 min-h-screen font-mono"
      style={{
        backgroundImage: "url('/gamesbackground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Heading with blue text and black border */}
        <h1
          className="text-4xl font-extrabold tracking-tight mb-8 text-center"
          style={{
            color: "blue",
            WebkitTextStroke: "1px black",
          }}
        >
          Brain Games
        </h1>

        {/* Grid of Games */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="relative h-80 shadow-lg border border-gray-200 hover:shadow-xl transition-transform duration-300 hover:scale-[1.01] overflow-hidden"
              style={{
                backgroundImage: `url('${game.bgImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* Content Container */}
              <div className="relative z-10 flex flex-col h-full p-4 text-white">
                {/* Title at the top */}
                <h2 className="text-2xl font-semibold mb-2">{game.title}</h2>

                {/* Spacer for description */}
                <div className="flex-1">
                  <p className="leading-relaxed">{game.description}</p>
                </div>

                {/* Button at the bottom */}
                <div>
                  <Link href={`/games/${game.id}`}>
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-300 ease-in-out transform hover:scale-105">
                      Play {game.title}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}