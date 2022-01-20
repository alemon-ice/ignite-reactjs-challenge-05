// import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

// import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          <Link href="/">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div>
                <div className={styles.createdAt}>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div className={styles.authorName}>
                  <FiUser />
                  <span>Joseph Oliveira</span>
                </div>
              </div>
            </a>
          </Link>
          <Link href="/">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div>
                <div className={styles.createdAt}>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div className={styles.authorName}>
                  <FiUser />
                  <span>Joseph Oliveira</span>
                </div>
              </div>
            </a>
          </Link>
          <Link href="/">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div>
                <div className={styles.createdAt}>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div className={styles.authorName}>
                  <FiUser />
                  <span>Joseph Oliveira</span>
                </div>
              </div>
            </a>
          </Link>
          <button type="button" className={styles.loadMorePosts}>
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
