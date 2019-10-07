import React, { createRef, FunctionComponent, useState } from "react";
import Layout from "@nehalist/gatsby-theme-nehalem/src/components/layout";
import { Post, Tag } from "@nehalist/gatsby-theme-nehalem/src/utils/models";
import { Container } from "@nehalist/gatsby-theme-nehalem/src/components/common";
import styled from "styled-components";
import Toc from "@nehalist/gatsby-theme-nehalem/src/components/toc";
import Img from "gatsby-image";
import ReadingProgress from "@nehalist/gatsby-theme-nehalem/src/components/reading-progress";
import { theme } from "../styles/theme";
import { graphql, Link } from "gatsby";
import slugify from "slugify";
import Bio from "@nehalist/gatsby-theme-nehalem/src/components/bio";
import Comments from "@nehalist/gatsby-theme-nehalem/src/components/comments";
import SEO from "@nehalist/gatsby-theme-nehalem/src/components/seo";
import { FaAlignJustify, FaTimes } from "react-icons/fa";

interface PostTemplateProps {
  data: {
    primaryTag: Tag | null;
    post: Post;
  };
  location: Location;
}

const PostContainer = styled(Container)`
  display: flex;
  justify-content: center;
  padding: 0 !important;
`;

const LeftSidebar = styled.div<{ show?: boolean }>`
  min-width: 255px;
  max-width: 225px;
  transition: opacity 0.5s;

  @media (max-width: ${theme.breakpoints.xl}) {
    position: fixed;
    display: ${props => (props.show ? "unset" : "none")};
    z-index: 1000;
    background-color: #fff;
    width: 100% !important;
    max-width: 100%;
    padding: 0 20px;
    margin-top: -5px;
    height: calc(100vh - 70px);
  }
`;

const PostContent = styled.div`
  margin-top: -5px;
  border-right: 1px #e5eff5 solid;
  border-left: 1px #e5eff5 solid;
  background-color: #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.03), 0 3px 46px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 1035px;
  max-width: 100%;

  li > a,
  p > a {
    color: ${theme.layout.linkColor};
    border-bottom: 2px ${theme.layout.linkColor} solid;
  }

  pre {
    margin: 30px 0;
  }

  blockquote {
    border-left: 4px ${theme.layout.primaryColor} solid;
    background-color: ${theme.layout.backgroundColor};
    margin: 30px 0;
    padding: 5px 20px;
    border-radius: 0.3em;
  }

  h3::before,
  h4::before,
  h5::before,
  h6::before {
    display: block;
    content: " ";
    height: 90px;
    margin-top: -90px;
    visibility: hidden;
  }

  h2 {
    border-top: 1px solid #ececec;
    margin-top: 44px;
    padding-top: 40px;
    line-height: 1.2;
  }

  code[class*="language-text"] {
    padding: 5px;
  }

  p > img {
    max-width: 100%;
    border-radius: 0.3em;
    margin: 30px 0;
  }

  hr {
    border-top: 1px solid #ececec;
    border-bottom: 0;
    margin-top: 44px;
    margin-bottom: 40px;
  }

  .gatsby-resp-image-link {
    margin: 30px 0;
    max-width: 100%;

    .gatsby-resp-image-image {
      border-radius: 0.3em;
    }
  }
`;

const TocWrapper = styled.div`
  position: sticky;
  top: 70px;
  padding: 40px 30px 40px 0;
`;

const PostHeader = styled.header`
  padding: 40px;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 20px;
  }
`;

const FeaturedImage = styled(Img)`
  border-radius: 0;
  @media (max-width: ${theme.breakpoints.xl}) {
    margin-left: -1px;
    margin-right: -1px;
  }
`;

const StyledPost = styled.section`
  padding: 40px;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 20px;
  }

  #flex-row__orms {
    display: flex;
    align-items: center;

    span {
      width: 100%;
      transform: scale3D(1, 0.9, 1);
    }

    span:nth-child(2) {
      transform: scale3D(0.75, 0.7, 1);
    }

    @media (max-width: ${theme.breakpoints.sm}) {
      flex-direction: column;
    }
  }
`;

const PostMeta = styled.section`
  display: flex;
  justify-content: space-between;
  opacity: 0.8;
  font-size: 0.9em;
`;

const PostTitle = styled.h1`
  margin: 0;
  padding: 0;
`;

const PostFooter = styled.footer`
  background-color: #fafafa;
  font-size: 0.8em;
  color: #666;
  padding: 40px;
  line-height: 1em;

  p {
    margin: 5px 0;
  }
`;

const FooterTagLink = styled(Link)`
  color: #000 !important;
  text-decoration: none;
  border-bottom: 0 !important;
`;

const PostAddition = styled.section`
  background-color: #fff;
  border-top: 1px #e5eff5 solid;
  border-bottom: 1px #e5eff5 solid;
  z-index: 700;
  position: relative;
  padding: 40px;
`;

const PostAdditionContent = styled(Container)`
  display: flex;
  justify-content: space-between;
`;

const BioWrapper = styled.div`
  width: 50%;
  margin: auto;

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const ToggleTocButton = styled.button`
  display: flex;
  position: fixed;
  justify-content: center;
  right: 20px;
  bottom: 20px;
  border-radius: 100%;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.03), 0 3px 46px rgba(0, 0, 0, 0.1);
  border: 0;
  z-index: 5000;
  width: 50px;
  height: 50px;
  background-color: ${theme.colors.secondary};
  color: #fff;
  outline: none;

  @media (min-width: ${theme.breakpoints.xl}) {
    display: none;
  }
`;

const PostTemplate: FunctionComponent<PostTemplateProps> = ({
  data,
  location,
}) => {
  const [showToc, setShowToc] = useState<boolean>(false);
  const post = data.post;
  const readingProgressRef = createRef<HTMLElement>();
  const primaryTag = data.primaryTag;
  const toggleToc = () => setShowToc(!showToc);

  return (
    <Layout bigHeader={false}>
      <SEO
        location={location}
        title={post.frontmatter.title}
        publishedAt={post.frontmatter.created}
        updatedAt={post.frontmatter.updated}
        tags={post.frontmatter.tags}
        description={post.frontmatter.excerpt}
        image={
          post.frontmatter.featuredImage
            ? post.frontmatter.featuredImage.childImageSharp.sizes.src
            : null
        }
      />
      <ReadingProgress
        target={readingProgressRef}
        color={primaryTag ? primaryTag.color : undefined}
      />
      <PostContainer>
        {post.headings.find(h => h.depth > 1) && (
          <>
            <LeftSidebar show={showToc}>
              <TocWrapper>
                <Toc onClick={toggleToc} />
              </TocWrapper>
            </LeftSidebar>
            <ToggleTocButton
              role="button"
              aria-label="Toggle table of contents"
              onClick={toggleToc}
            >
              {showToc ? <FaTimes /> : <FaAlignJustify />}
            </ToggleTocButton>
          </>
        )}
        <PostContent>
          <article className={`post`} ref={readingProgressRef}>
            <PostHeader>
              <PostMeta>
                {post.frontmatter.tags.length > 0 && (
                  <Link
                    to={`/tag/${slugify(post.frontmatter.tags[0], {
                      lower: true,
                    })}`}
                  >
                    {post.frontmatter.tags[0]}
                  </Link>
                )}
                <time dateTime={post.frontmatter.created}>
                  {post.frontmatter.createdPretty}
                </time>
              </PostMeta>
              <PostTitle>{post.frontmatter.title}</PostTitle>
            </PostHeader>
            {post.frontmatter.featuredImage && (
              <FeaturedImage
                sizes={post.frontmatter.featuredImage.childImageSharp.sizes}
              />
            )}
            <StyledPost
              dangerouslySetInnerHTML={{ __html: post.html }}
              className={`post`}
            />
            <PostFooter>
              <p>
                Published under&nbsp;
                {post.frontmatter.tags.map((tag, index) => (
                  <span key={index}>
                    <FooterTagLink to={`/tag/${slugify(tag, { lower: true })}`}>
                      {tag}
                    </FooterTagLink>
                    {post.frontmatter.tags.length > index + 1 && <>, </>}
                  </span>
                ))}
                &nbsp;on{" "}
                <time dateTime={post.frontmatter.created}>
                  {post.frontmatter.createdPretty}
                </time>
                .
              </p>
              {post.frontmatter.updated !== post.frontmatter.created && (
                <p>
                  Last updated on{" "}
                  <time dateTime={post.frontmatter.updated}>
                    {post.frontmatter.updatedPretty}
                  </time>
                  .
                </p>
              )}
            </PostFooter>
          </article>
        </PostContent>
      </PostContainer>
      <PostAddition>
        <PostAdditionContent>
          <BioWrapper>
            <Bio textAlign={`center`} showName={true} />
          </BioWrapper>
        </PostAdditionContent>
      </PostAddition>
      <Comments />
    </Layout>
  );
};

export default PostTemplate;

export const query = graphql`
  query PrimaryTag2($postId: String!, $primaryTag: String!) {
    post: markdownRemark(id: { eq: $postId }) {
      headings {
        depth
      }
      frontmatter {
        title
        path
        tags
        excerpt
        created
        createdPretty: created(formatString: "DD MMMM, YYYY")
        updated
        updatedPretty: created(formatString: "DD MMMM, YYYY")
        featuredImage {
          childImageSharp {
            sizes(maxWidth: 800, quality: 75) {
              ...GatsbyImageSharpSizes
            }
          }
        }
      }
      html
    }
    primaryTag: tags(name: { eq: $primaryTag }) {
      name
      color
    }
  }
`;
