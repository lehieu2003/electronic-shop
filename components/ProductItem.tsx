import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import ProductItemRating from './ProductItemRating';

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
  return (
    <div className='flex flex-col items-center gap-y-2'>
      <Link href={`/product/${product.slug}`}>
        <Image
          src={
            product.mainImage
              ? `/${product.mainImage}`
              : '/product_placeholder.jpg'
          }
          width='0'
          height='0'
          sizes='100vw'
          className='w-auto h-[300px]'
          alt={product?.title}
        />
      </Link>
      <Link
        href={`/product/${product.slug}`}
        className={
          color === 'black'
            ? `text-xl text-black font-normal mt-2 uppercase`
            : `text-xl text-white font-normal mt-2 uppercase`
        }
      >
        {product.title}
      </Link>
      <p
        className={
          color === 'black'
            ? 'text-lg text-black font-semibold'
            : 'text-lg text-white font-semibold'
        }
      >
        ${product.price}
      </p>

      <ProductItemRating productRating={product?.rating} />
      <Link
        href={`/product/${product?.slug}`}
        className='flex justify-center items-center w-full uppercase bg-white px-0 py-2 text-base border border-black font-bold text-blue-600 shadow-sm hover:bg-black focus:outline-none focus:ring-2'
      >
        <p>View product</p>
      </Link>
    </div>
  );
};

export default ProductItem;
