const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:Cfmarc%402026!!@localhost:5432/intradesk"
        }
    }
});

async function main() {
    try {
        const docCount = await prisma.document.count();
        const faqCount = await prisma.fAQ.count(); // Assuming the model is FAQ
        
        console.log(`Documents found: ${docCount}`);
        console.log(`FAQs found: ${faqCount}`);
    } catch (e) {
        console.log("Error querying DB: " + e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
