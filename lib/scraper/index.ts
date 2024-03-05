import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url:string){
    if(!url){
        return;
    }

    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_beac93f1-zone-pricewise:e1pdi2kd4j1o -k https://lumtest.com/myip.json

    //Brightdata proxy configuration
    const username=String(process.env.BRIGHT_DATA_USERNAME);
    const password=String(process.env.BRIGHT_DATA_PASSWORD);
    const port=22225;
    const session_id= (1000000*Math.random())|0;
    const options={
        auth:{
            username:`${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized:false,

    }

    try {
        //fetch the product page
        const response= await axios.get(url,options);
        // console.log(response.data);
        const $= cheerio.load(response.data);

        //extract product title
        const title= $('#productTitle').text().trim();
        const currentPrice= extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price')
        );

        const originalPrice= extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        )

        const outOfStock=$('#availability span').text().trim().toLowerCase()==='currently unavailable';
            
        const images= $('#imgBlkFront').attr('data-a-dynamic-image')||
        $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const imageUrls= Object.keys(JSON.parse(images));

        const currency= extractCurrency($('.a-price-symbol'))
        
        const discountRate= $('.savingsPercentage').text().replace(/[-%]/g,'');

        const stars= $('.a-fixed-left-grid.AverageCustomerReviews.a-spacing-small span.a-size-medium.a-color-base').text().trim();

        const ratings= $('#averageCustomerReviews_feature_div.celwidget span#acrCustomerReviewText').text().trim();

        // const description= $('.a-row.a-spacing-top-small #comparison_title span.a-size-base.a-color-base').text().trim();

        let description:string[]=[];

        const des= $('#featurebullets_feature_div.celwidget span.a-list-item').each(function(index, element) {
            const itemText:string = $(this).text();
            description.push(itemText);
          });
        

        const data= {
            url,
            currency: currency || '₹',
            image: imageUrls[0],
            title,
            currentPrice:Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory:[Number],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount:ratings,
            stars: stars,
            isOutOfStock: outOfStock,
            description,
            lowestPrice:Number(currentPrice) || Number(originalPrice),
            highestPrice:Number(originalPrice) || Number(currentPrice),
            averagePrice:Number(currentPrice) || Number(originalPrice)
        }


        console.log({title,currentPrice,originalPrice, outOfStock,images,imageUrls,currency ,stars,ratings});
        for(const el of description){
            console.log(el);
        }

        return data;
        
    } catch (error:any) {
        throw new Error(`Failed to scrape product:${error.message}`);
    }
}