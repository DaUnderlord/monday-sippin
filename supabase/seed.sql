-- Seed data for Monday Sippin' website

-- Insert default categories
INSERT INTO categories (name, slug, description, color, order_index) VALUES
('Ecosystem Review', 'ecosystem-review', 'In-depth analysis of blockchain ecosystems', '#1B4B5A', 1),
('Market Analysis', 'market-analysis', 'Market trends and financial insights', '#F4A261', 2),
('Personal Finance', 'personal-finance', 'Financial advice for individuals', '#6B46C1', 3),
('Business Strategy', 'business-strategy', 'Strategic insights for businesses', '#52B788', 4),
('Industry News', 'industry-news', 'Latest news and updates', '#E76F51', 5),
('Educational Content', 'educational-content', 'Learning resources and tutorials', '#1B4B5A', 6);

-- Insert hierarchical filters
-- Level 1 filters (main categories)
INSERT INTO filters (name, slug, level, order_index) VALUES
('Blockchain Ecosystems', 'blockchain-ecosystems', 1, 1),
('Financial Markets', 'financial-markets', 1, 2),
('Investment Strategies', 'investment-strategies', 1, 3),
('Technology Trends', 'technology-trends', 1, 4),
('Regulatory Updates', 'regulatory-updates', 1, 5);

-- Level 2 filters (subcategories)
INSERT INTO filters (name, slug, parent_id, level, order_index) VALUES
-- Blockchain Ecosystems subcategories
('Ethereum', 'ethereum', (SELECT id FROM filters WHERE slug = 'blockchain-ecosystems'), 2, 1),
('Solana', 'solana', (SELECT id FROM filters WHERE slug = 'blockchain-ecosystems'), 2, 2),
('Polygon', 'polygon', (SELECT id FROM filters WHERE slug = 'blockchain-ecosystems'), 2, 3),
('Avalanche', 'avalanche', (SELECT id FROM filters WHERE slug = 'blockchain-ecosystems'), 2, 4),
('Cardano', 'cardano', (SELECT id FROM filters WHERE slug = 'blockchain-ecosystems'), 2, 5),

-- Financial Markets subcategories
('Cryptocurrency', 'cryptocurrency', (SELECT id FROM filters WHERE slug = 'financial-markets'), 2, 1),
('Traditional Markets', 'traditional-markets', (SELECT id FROM filters WHERE slug = 'financial-markets'), 2, 2),
('Commodities', 'commodities', (SELECT id FROM filters WHERE slug = 'financial-markets'), 2, 3),
('Forex', 'forex', (SELECT id FROM filters WHERE slug = 'financial-markets'), 2, 4),

-- Investment Strategies subcategories
('DeFi', 'defi', (SELECT id FROM filters WHERE slug = 'investment-strategies'), 2, 1),
('Yield Farming', 'yield-farming', (SELECT id FROM filters WHERE slug = 'investment-strategies'), 2, 2),
('Staking', 'staking', (SELECT id FROM filters WHERE slug = 'investment-strategies'), 2, 3),
('Portfolio Management', 'portfolio-management', (SELECT id FROM filters WHERE slug = 'investment-strategies'), 2, 4),

-- Technology Trends subcategories
('NFTs', 'nfts', (SELECT id FROM filters WHERE slug = 'technology-trends'), 2, 1),
('Gaming', 'gaming', (SELECT id FROM filters WHERE slug = 'technology-trends'), 2, 2),
('Metaverse', 'metaverse', (SELECT id FROM filters WHERE slug = 'technology-trends'), 2, 3),
('AI & Blockchain', 'ai-blockchain', (SELECT id FROM filters WHERE slug = 'technology-trends'), 2, 4);

-- Level 3 filters (specific topics)
INSERT INTO filters (name, slug, parent_id, level, order_index) VALUES
-- DeFi subcategories
('Lending Protocols', 'lending-protocols', (SELECT id FROM filters WHERE slug = 'defi'), 3, 1),
('DEX Trading', 'dex-trading', (SELECT id FROM filters WHERE slug = 'defi'), 3, 2),
('Liquidity Mining', 'liquidity-mining', (SELECT id FROM filters WHERE slug = 'defi'), 3, 3),

-- NFTs subcategories
('Art & Collectibles', 'art-collectibles', (SELECT id FROM filters WHERE slug = 'nfts'), 3, 1),
('Utility NFTs', 'utility-nfts', (SELECT id FROM filters WHERE slug = 'nfts'), 3, 2),
('NFT Marketplaces', 'nft-marketplaces', (SELECT id FROM filters WHERE slug = 'nfts'), 3, 3);

-- Insert common tags
INSERT INTO tags (name, slug) VALUES
('beginner', 'beginner'),
('intermediate', 'intermediate'),
('advanced', 'advanced'),
('tutorial', 'tutorial'),
('analysis', 'analysis'),
('news', 'news'),
('guide', 'guide'),
('review', 'review'),
('comparison', 'comparison'),
('prediction', 'prediction'),
('security', 'security'),
('regulation', 'regulation'),
('adoption', 'adoption'),
('innovation', 'innovation'),
('partnership', 'partnership');

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();