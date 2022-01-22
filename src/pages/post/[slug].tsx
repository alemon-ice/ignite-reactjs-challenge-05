import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatCreatedAtInfo } from '../../util/format';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  nextPost: Post | null;
  prevPost: Post | null;
}

export default function Post({
  post,
  preview,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const amountWordsOfBody = RichText.asText(
    post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const amountWordsOfHeading = post.data.content.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, ...data.heading.split(' ')];
    }

    return [...acc];
  }, []).length;

  const readingTime = Math.ceil(
    (amountWordsOfBody + amountWordsOfHeading) / 200
  );
  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.bannerWrapper}>
          <img src={post.data.banner.url} alt="banner" />
        </div>

        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.postDetails}>
            <div className={styles.createdAt}>
              <FiCalendar />
              <time>{formatCreatedAtInfo(post.first_publication_date)}</time>
            </div>
            <div className={styles.authorName}>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div className={styles.readingTime}>
              <FiClock />
              <span>{readingTime} min</span>
            </div>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                {heading && <h2>{heading}</h2>}

                <div
                  className={styles.postSection}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                />
              </div>
            ))}
          </div>
        </article>
        <footer className={styles.navigationController}>
          <div>
            {prevPost && (
              <Link href={`/post/${prevPost.uid}`}>
                <a>
                  <h4>{prevPost.data.title}</h4>
                  <span>Post anterior</span>
                </a>
              </Link>
            )}
          </div>
          <div>
            {nextPost && (
              <Link href={`/post/${nextPost.uid}`}>
                <a>
                  <h4>{nextPost.data.title}</h4>
                  <span>Próximo post</span>
                </a>
              </Link>
            )}
          </div>
        </footer>
        {/* <UtterancesComments /> */}
        {preview && (
          <aside className={commonStyles.exitPreviewButton}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'publications')],
    { pageSize: 2 }
  );

  const paths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publications', String(params.slug), {
    ref: previewData?.ref ?? null,
  });

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'publications')],
    {
      pageSize: 2,
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'publications')],
    {
      pageSize: 2,
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      preview,
      nextPost: nextPost.results[0] ?? null,
      prevPost: prevPost.results[0] ?? null,
      post,
    },
  };
};
