import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatPostsResponse, formatCreatedAtInfo } from '../util/format';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function loadMorePosts(): Promise<void> {
    const response = await fetch(`${nextPage}`).then(res => res.json());

    const morePosts = formatPostsResponse(response);

    setPosts(state => [...state, ...morePosts]);
    setNextPage(response.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <div className={styles.createdAt}>
                    <FiCalendar />
                    <time>
                      {formatCreatedAtInfo(post.first_publication_date)}
                    </time>
                  </div>
                  <div className={styles.authorName}>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {nextPage ? (
            <button
              type="button"
              className={styles.loadMorePosts}
              onClick={loadMorePosts}
            >
              Carregar mais posts
            </button>
          ) : null}

          {preview && (
            <aside className={commonStyles.exitPreviewButton}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'publications')],
    {
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = formatPostsResponse(response);

  return {
    props: {
      preview,
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
  };
};
