/**
 * Test script for the Twitter/X scraper
 * Usage: node test-scraper.js <username> [limit]
 * Example: node test-scraper.js elonmusk 50
 */

const { scrapeFollowing } = require('./scraper');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node test-scraper.js <username> [limit]');
    console.log('Example: node test-scraper.js elonmusk 50');
    process.exit(1);
  }
  
  const username = args[0];
  const limit = parseInt(args[1]) || 100;
  
  console.log(`\n🔄 Starting scraper test...`);
  console.log(`Username: @${username}`);
  console.log(`Limit: ${limit} accounts`);
  console.log(`Time: ${new Date().toLocaleString()}\n`);
  
  try {
    const following = await scrapeFollowing(username, limit);
    
    console.log(`\n✅ Scraping completed successfully!\n`);
    console.log(`Total accounts scraped: ${following.length}\n`);
    
    // Display first 10 results
    console.log('First 10 accounts:');
    console.log('─'.repeat(60));
    following.slice(0, 10).forEach((account, index) => {
      console.log(`${index + 1}. @${account.username}`);
      if (account.displayName) {
        console.log(`   Name: ${account.displayName}`);
      }
      console.log(`   Followed by: @${account.followed_by}\n`);
    });
    
    if (following.length > 10) {
      console.log(`... and ${following.length - 10} more accounts\n`);
    }
    
    // Display raw JSON for all results
    console.log('\nFull JSON output:');
    console.log(JSON.stringify(following, null, 2));
    
  } catch (error) {
    console.error(`\n❌ Error during scraping:`);
    console.error(error.message);
    process.exit(1);
  }
}

main();
