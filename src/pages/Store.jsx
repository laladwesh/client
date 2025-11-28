import React from 'react';
import ProductDisplay from '../components/New';

const Store = () => {
  return (
    <div className=''>
      <h1 className='font-bdogrotesk-black text-black text-9xl px-6 py-28'>Store</h1>
    <ProductDisplay isStore={true} />
    </div>
  );
};

export default Store;
