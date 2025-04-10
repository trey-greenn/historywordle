import Head from 'next/head';

type SEOProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  structuredData?: object | null;
};

const SEO = ({
  title = 'History Wordle - Guess the Mystery Historical Figure',
  description = 'Dive into the past with History Wordle, the ultimate guessing game for history enthusiasts. Test your knowledge of historical figures from various eras by guessing the mystery figure in a limited number of tries. Enjoy a fun and educational way to learn more about influential personalities from history.',
  url = 'www.historywordle.com',
  image = '/wordle.png',
  type = 'website',
  structuredData = null,
}: SEOProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

export default SEO;
