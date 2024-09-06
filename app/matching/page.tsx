"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Heart, MessageCircle, Users, User } from "lucide-react";
import { K2D } from "next/font/google";
import { motion } from "framer-motion";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

const users = [
  {
    name: "John Doe",
    images: ["/images/john1.jpg", "/images/john2.jpeg", "/images/john3.jpg"],
    tags: ["Travel", "Photography", "Foodie"],
    bio: "Adventure seeker and coffee enthusiast. Always looking for the next exciting experience!",
  },
  {
    name: "Jim Smith",
    images: ["/images/jim1.jpg", "/images/jim2.jpg"],
    tags: ["Fitness", "Tech", "Movies"],
    bio: "Software developer by day, fitness junkie by night. Love discussing the latest tech trends and watching classic films.",
  },
];

export default function Matching() {
  const [currentUser, setCurrentUser] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setTimeout(() => {
      setCurrentUser((prev) => (prev + 1) % users.length);
      setCurrentImage(0);
      setDirection(0);
    }, 500);
  };

  const handlePrevious = () => {
    setDirection(-1);
    setTimeout(() => {
      setCurrentUser((prev) => (prev - 1 + users.length) % users.length);
      setCurrentImage(0);
      setDirection(0);
    }, 500);
  };

  const handleImageNext = () => {
    setCurrentImage((prev) => {
      if (prev === users[currentUser].images.length - 1) {
        return prev;
      } else {
        return prev + 1;
      }
    });
  };

  const handleImagePrevious = () => {
    setCurrentImage((prev) => {
      if (prev === 0) {
        return prev;
      } else {
        return prev - 1;
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-primary to-secondary">
      <h1 className={`text-xl font-bold pb-0.5 text-center text-primary-foreground ${k2d.className}`}>DEVLINK</h1>
      <motion.div
        className="w-full max-w-md bg-background shadow-lg overflow-hidden relative flex-grow"
        animate={{ x: direction * 400 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Image */}
        <div className="relative h-[400px]">
          <img
            src={users[currentUser].images[currentImage]}
            alt={users[currentUser].name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end">
            <div className="flex flex-col w-full p-2 gap-1">
              <h2 className={`text-3xl font-bold text-primary-foreground ${k2d.className}`}>{users[currentUser].name}</h2>
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {users[currentUser].tags.map((tag, index) => (
                  <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleImagePrevious}
            className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={handleImageNext}
            className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight size={40} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-2">
          {/* Buttons */}
          <div className="flex justify-center space-x-4 mb-3">
            <button
              onClick={handlePrevious}
              className="bg-destructive text-destructive-foreground rounded-full p-4 shadow-lg hover:bg-destructive/90 transition-colors"
              aria-label="Dislike"
            >
              <X size={24} />
            </button>
            <button
              onClick={handleNext}
              className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="Like"
            >
              <Heart size={24} />
            </button>
          </div>

          {/* Bio */}
          <p className="font-bold text-foreground">Who am I?</p>
          <p className="text-muted-foreground">{users[currentUser].bio}</p>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Messages">
            <MessageCircle size={24} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Matches">
            <Users size={24} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Profile">
            <User size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
}
