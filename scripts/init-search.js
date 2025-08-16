const { configureSearchIndex, indexAllArticles } = require('../src/lib/search-indexing');

async function initializeSearch() {
  try {
    console.log('🔍 Initializing Algolia search...');
    
    console.log('📝 Configuring search index...');
    await configureSearchIndex();
    
    console.log('📚 Indexing all articles...');
    await indexAllArticles();
    
    console.log('✅ Search initialization completed successfully!');
  } catch (error) {
    console.error('❌ Search initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeSearch();
}

module.exports = { initializeSearch };