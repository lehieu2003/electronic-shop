'use client';
import React from 'react';
const Slider = require('react-slick').default as any;
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Link from 'next/link';
import Image from 'next/image';

function SimpleSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div className='slider-container max-w-screen-2xl mx-auto px-16 max-md:px-7'>
      <Slider {...settings}>
        <div className='h-[500px] max-lg:h-[400px] max-md:h-[250px] max-[500px]:h-[200px] max-[400px]:h-[150px] relative'>
          <div className='absolute left-[50%] translate-x-[-50%] translate-y-[30%] h-full text-center max-lg:translate-y-[25%] max-md:translate-y-[20%] max-sm:hidden'>
            <p className='text-xl font-light underline underline-offset-4 mb-5 max-[1162px]:text-lg max-lg:mb-2 max-md:text-base max-md:mb-1'>
              Headphones
            </p>
            <h2 className='text-5xl font-light mb-5 max-[1162px]:text-4xl max-lg:mb-2 max-lg:text-3xl max-md:text-2xl max-md:mb-1'>
              Just to rock your mood
            </h2>
            <p className='mb-5 text-black text-lg font-medium max-[1162px]:text-base max-lg:mb-2 max-lg:text-sm max-md:mb-1'>
              Fine-tune your listening experience by using the convenient volume
              slider to adjust sound intensity to your preference.
            </p>
            <Link
              href='/shop'
              className='bg-custom-yellow btn w-52 h-14 text-black uppercase border border-black text-xl hover:bg-black hover:text-custom-yellow max-[1162px]:w-44 max-[1162px]:h-10 max-[1162px]:text-lg max-lg:text-base max-lg:w-36 max-md:text-sm max-md:w-32'
            >
              Shop now
            </Link>
            <Image
              src='/slider image 1.webp'
              alt='slider 1'
              className='h-full'
              width={1200}
              height={500}
              priority
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <Image
              src='/slider image 1.webp'
              alt='slider 1'
              className='h-full'
              width={1200}
              height={500}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority
            />
          </div>
          <div className='h-[500px] max-lg:h-[400px] max-md:h-[250px] max-[500px]:h-[200px] max-[400px]:h-[150px] relative'>
            <div className='absolute left-[50%] translate-x-[-50%] translate-y-[30%] h-full text-center max-lg:translate-y-[25%] max-md:translate-y-[20%] max-sm:hidden'>
              <p className='text-xl font-light underline underline-offset-4 mb-5 max-[1162px]:text-lg max-lg:mb-2 max-md:text-base max-md:mb-1'>
                Earbud
              </p>
              <h2 className='text-5xl font-light mb-5 max-[1162px]:text-4xl max-lg:mb-2 max-lg:text-3xl max-md:text-2xl max-md:mb-1'>
                Go wireless or go home
              </h2>
              <p className='mb-5 text-black text-lg font-medium max-[1162px]:text-base max-lg:mb-2 max-lg:text-sm max-md:mb-1'>
                Seamlessly control your sound world by sliding the volume to
                your
                <Image
                  src='/slider image 2.webp'
                  alt='slider 2'
                  className='h-full'
                  width={1200}
                  height={500}
                  priority
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </p>
              <Link
                href='/shop'
                className='bg-custom-yellow btn w-52 h-14 text-black uppercase border border-black text-xl hover:bg-black hover:text-custom-yellow max-[1162px]:w-44 max-[1162px]:h-10 max-[1162px]:text-lg max-lg:text-base max-lg:w-36 max-md:text-sm max-md:w-32'
              >
                Shop now
              </Link>
            </div>
            <Image
              src='/slider image 2.webp'
              alt='slider 1'
              className='h-full'
              width={1200}
              height={500}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority
            />
          </div>
        </div>
      </Slider>
    </div>
  );
}

export default SimpleSlider;
