"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { useState } from "react"

const Searchbar = () => {
    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false)

    const isValidAmazonProductURL= (url:string)=>{
            try {   
                const parsedURL= new URL(url);
                const hostname= parsedURL.hostname;

                //check if hostname is correct (for amazon)
                if(hostname.includes('amazon.com') 
                || hostname.includes('amazon.') 
                || hostname.endsWith('amazon')){
                    return true;
                }
                
            } catch (error) {
                return false;   
            }
    }

    const handleSubmit= async(event: FormEvent<HTMLFormElement>)=>{
            event.preventDefault();

            const isValidLink= isValidAmazonProductURL(searchPrompt);

            if(!isValidLink)return alert('Please provide a vald Amazon link');

            try {
                setIsLoading(true);
                
                //scraping
                const product= await scrapeAndStoreProduct(searchPrompt);

            } catch (error) {
                console.log(error);
            }finally{
                setIsLoading(false);
            }
    }

  return (
    <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
        <input 
            type="text"
            value={searchPrompt}
            onChange={(e)=>setSearchPrompt(e.target.value)}
            
            placeholder="Enter product link"
            className="searchbar-input"
        />

        <button 
            className="searchbar-btn" 
            type='submit'
            disabled={searchPrompt===''}
        >
            {
                isLoading? 'Searching...':'Search'
            }
        </button>
    </form>
  )
}

export default Searchbar