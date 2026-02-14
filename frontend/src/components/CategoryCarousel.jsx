import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "../redux/jobSlice";

const category = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Data Science",
];

const CategoryCarousel = () => {
const dispatch = useDispatch();
    const navigate = useNavigate();

  const searchJobHandler = (query) => {
          dispatch(setSearchedQuery(query));
          navigate("/browse");
      }
  return (
    <div className="py-12 bg-white">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-gray-800">
        Explore Job Categories
      </h2>

      {/* Carousel */}
      <Carousel className="w-full max-w-3xl mx-auto">
        <CarouselContent>
          {category.map((cat, index) => (
            <CarouselItem
              key={index}
              className="md:basis-1/2 lg:basis-1/3 flex justify-center"
            >
              <Button onClick={()=>searchJobHandler(cat)} className="bg-[#0f4c81] hover:bg-[#0d3c6c] text-white font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                {cat}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Controls */}
        <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm" />
        <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm" />
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;
