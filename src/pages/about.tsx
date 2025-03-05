import React from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <Layout 
      title="About - Nifty Thrifty" 
      description="Learn about Nifty Thrifty, the premier marketplace for second-hand baby items in Cape Town."
    >
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About Nifty Thrifty</h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              Nifty Thrifty is a dedicated marketplace for parents in Cape Town looking to buy and sell second-hand baby items. 
              Our platform brings together listings from various WhatsApp groups, making it easier to find exactly what you need 
              without scrolling through endless messages.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              Our mission is to create a sustainable, affordable, and convenient way for parents to find quality baby items 
              while extending the lifecycle of products that still have plenty of use left in them. By facilitating the 
              second-hand market, we help:
            </p>
            <ul>
              <li>Reduce waste and promote sustainability</li>
              <li>Make quality baby items more affordable for all families</li>
              <li>Connect local parents and build community</li>
              <li>Simplify the buying and selling process</li>
            </ul>
            
            <h2>How It Works</h2>
            <p>
              Nifty Thrifty aggregates listings from various WhatsApp groups dedicated to second-hand baby items in Cape Town. 
              Our platform categorizes and organizes these listings, making them searchable and filterable by:
            </p>
            <ul>
              <li>Category (clothing, toys, furniture, etc.)</li>
              <li>Location within Cape Town</li>
              <li>Price range</li>
              <li>Item condition</li>
            </ul>
            <p>
              We also highlight "In Search Of" (ISO) posts, where parents are looking for specific items, 
              helping connect buyers with sellers more efficiently.
            </p>
            
            <h2>Join Our Community</h2>
            <p>
              Nifty Thrifty is more than just a marketplace—it's a community of parents helping parents. 
              By participating, you're not only finding great deals or selling items your child has outgrown, 
              but you're also contributing to a more sustainable future and helping other families in Cape Town.
            </p>
            <p>
              Ready to get started? <Link href="/listings" className="text-primary-600 hover:text-primary-700">Browse listings</Link> or 
              check out what people are <Link href="/iso" className="text-primary-600 hover:text-primary-700">looking for</Link>.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              Have questions, suggestions, or feedback? We'd love to hear from you! 
              Please visit our <Link href="/contact" className="text-primary-600 hover:text-primary-700">contact page</Link> to get in touch.
            </p>
          </div>
          
          <div className="mt-12 bg-primary-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Why Choose Nifty Thrifty?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-2">Organized & Searchable</h3>
                <p className="text-secondary-600">
                  No more endless scrolling through WhatsApp messages. Our platform categorizes and organizes listings for easy searching.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-2">Local & Community-Focused</h3>
                <p className="text-secondary-600">
                  All listings are from Cape Town parents, making pickup convenient and building local connections.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-2">Sustainable & Eco-Friendly</h3>
                <p className="text-secondary-600">
                  By buying and selling second-hand, you're helping reduce waste and extending the lifecycle of baby items.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-2">Budget-Friendly</h3>
                <p className="text-secondary-600">
                  Find quality baby items at a fraction of the retail price, helping your family save money.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 