'use client';

import CategorizedProducts from "@/components/CategorizedProducts";

export default function Home() {
 

 
  const categories = ["mounts", "pretty", "Skincare", "aryan", "Beauty & Personal Care"]; //tags 

  return (
    <div >

       
        {/* Category sections */}
       {categories.map((category) => {
  console.log("Category:", category);
  return <CategorizedProducts key={category} tag={category} />;
})}

      </div>
  );
}
