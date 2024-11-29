require('dotenv').config();
const axios = require('axios');
const Sentiment = require('sentiment');

// Weights for the composite formula
const WEIGHTS = { Sm: 0.4, Sn: 0.3, Fg: 0.3, So: 0 }; 

// Fetch Social Media Sentiment using Social Searcher API
async function fetchSocialMediaSentiment() {
    try {
        const response = await axios.get("https://api.social-searcher.com/v2/search", {
            params: {
                key: process.env.SOCIAL_SEARCHER_API_KEY, // Your API key
                q: "Bitcoin", // Keyword for sentiment analysis
                lang: "en", // Language filter
            },
        });

        const posts = response.data.posts || [];
        console.log(`\nFetched ${posts.length} posts for keyword: Bitcoin`);

        // Analyze sentiment using Sentiment.js
        const sentiment = new Sentiment();
        const scores = posts.map((post) => sentiment.analyze(post.message || "").comparative);
        const averageSentiment = scores.reduce((a, b) => a + b, 0) / scores.length || 0;

        console.log(`Average Sentiment Score for "Bitcoin": ${averageSentiment}`);
        return averageSentiment;
    } catch (error) {
        console.error("Error fetching social media sentiment:", error.response?.data || error.message);
        return 0;
    }
}

// Fetch News Sentiment
// Fetch News Sentiment
async function fetchNewsSentiment() {
    try {
        const sentiment = new Sentiment();

        // Sample news articles (in a real application, fetch dynamically)
        const newsArticles = [
            "Market rallies on strong earnings",
            "Concerns over interest rate hikes",
            "Bitcoin reaches all-time high as adoption grows",
            "Crypto crash feared amid regulatory scrutiny",
        ];

        // Bullish and bearish keywords
        const bullishKeywords = [
            "rally", "all-time high", "surge", "adoption", "bull run", "institutional investment", "ETF approval"
        ];
        const bearishKeywords = [
            "crash", "sell-off", "regulation", "ban", "correction", "liquidation", "bear market", "recession"
        ];

        // Calculate sentiment scores for each article
        const scores = newsArticles.map((article) => {
            const baseScore = sentiment.analyze(article).comparative;

            // Check for bullish and bearish keywords
            const containsBullish = bullishKeywords.some((word) => article.toLowerCase().includes(word));
            const containsBearish = bearishKeywords.some((word) => article.toLowerCase().includes(word));

            // Adjust sentiment based on keyword presence
            let adjustedScore = baseScore;
            if (containsBullish) adjustedScore += 0.5; // Add weight for bullish sentiment
            if (containsBearish) adjustedScore -= 0.5; // Subtract weight for bearish sentiment

            return adjustedScore;
        });

        // Calculate average sentiment score
        const averageSentiment = scores.reduce((a, b) => a + b, 0) / scores.length;
        console.log(`Average News Sentiment: ${averageSentiment}`);
        return averageSentiment;
    } catch (error) {
        console.error("Error fetching news sentiment:", error.message);
        return 0;
    }
}


// Fetch Fear and Greed Index
async function fetchFearGreedIndex() {
    try {
        const response = await axios.get("https://api.alternative.me/fng/?limit=1");
        const index = response.data.data[0].value;
        console.log(`Fear and Greed Index: ${index}`);
        return (index - 50) / 50; // Normalize to -1 to 1
    } catch (error) {
        console.error("Error fetching fear and greed index:", error.message);
        return 0;
    }
}

// Calculate Composite Sentiment Score
async function calculateCompositeSentiment() {
    const Sm = await fetchSocialMediaSentiment();
    const Sn = await fetchNewsSentiment();
    const Fg = await fetchFearGreedIndex();
    const So = 0; // Placeholder for on-chain sentiment

    const compositeScore = (WEIGHTS.Sm * Sm) +
        (WEIGHTS.Sn * Sn) +
        (WEIGHTS.Fg * Fg) +
        (WEIGHTS.So * So);

    console.log(`Composite Sentiment Score: ${compositeScore}`);
    return compositeScore;
}

// Generate Prediction
async function generatePrediction() {
    const sentimentScore = await calculateCompositeSentiment();

    if (sentimentScore > 0.5) {
        return { signal: "Bullish", message: "Bullish trend detected. Consider buying." };
    } else if (sentimentScore < -0.5) {
        return { signal: "Bearish", message: "Bearish trend detected. Consider selling or shorting." };
    } else {
        return { signal: "Neutral", message: "Neutral trend detected. Hold position." };
    }
}

// Export functions
module.exports = {
    fetchSocialMediaSentiment,
    fetchNewsSentiment,
    fetchFearGreedIndex,
    calculateCompositeSentiment,
    generatePrediction,
};
