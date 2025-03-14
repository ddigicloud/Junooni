"use client";

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import BannerImage from "@assets/Banner.png"
import Image from "next/image"

const Carousel = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={50}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop={true}
      className="w-full h-full mx-auto"
    >
      <SwiperSlide>
        <Image src={BannerImage} alt="Slide 1" className="w-full h-auto" />
      </SwiperSlide>
      <SwiperSlide>
        <Image src={BannerImage} alt="Slide 2" className="w-full h-auto" />
      </SwiperSlide>
      <SwiperSlide>
        <Image src={BannerImage} alt="Slide 3" className="w-full h-auto" />
      </SwiperSlide>
    </Swiper>
  );
};

export default Carousel;
