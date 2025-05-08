import "@/styles/globals.css";
import type { AppProps } from "next/app";
import GoogleAnalytics from '@/components/GoogleAnalytics';
import SEO from '@/components/SEO';
import { DefaultSeo } from 'next-seo';

const defaultSEOConfig = {
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.historywordle.com',
    siteName: 'History Wordle',
    images: [
      {
        url: 'https://www.historywordle.com/wordle.png',
        width: 1200,
        height: 630,
        alt: 'History Wordle - Guess the Mystery Historical Figure',
      },
    ],
  },
  twitter: {
    handle: '@historywordle',
    site: '@historywordle',
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
  additionalMetaTags: [
    {
      name: 'theme-color',
      content: '#ffffff',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
  ],
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo {...defaultSEOConfig} />
      <SEO />
      <GoogleAnalytics />
      <Component {...pageProps} />
    </>
  );
}
