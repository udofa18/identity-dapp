import {
  collection,
  doc,
  getDoc,
  getDocs,
  // limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  // orderBy,
  where,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CommentBox from "../../components/CommentBox";
import Like from "../../components/like.tsx";
  import FeatureBlogs from "../../components/FeatureBlogs";
//   import RelatedBlog from "../components/RelatedBlog";
import Tags from "../../components/Tags";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/auth";
import Spinner from "../../components/Spinner.js";
import UserComment from "../../components/UserComment.tsx";
import { onAuthStateChanged } from "firebase/auth";
import Trending from "../../components/Trending.tsx";
import "react-markdown-editor-lite/lib/index.css";
import gfm from 'remark-gfm'
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import language from 'react-syntax-highlighter/dist/esm/languages/hljs/1c';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';

import {
  paragraphStyle,
  heading1,
  heading2,
  heading3,
  heading4,
  heading5,
  heading6,
  orderedListStyle,
  unorderedListStyle,
 
} from '../posts/MarkdownStyles.tsx'



const PostDetail = () => {

  
  const [authUser, setAuthUser] = useState(null);
  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });
    return () => {
      listen();
    };
  }, []);


  const url = window.location.href
  const userId = authUser?.uid;
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [userComment, setUserComment] = useState("");
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [profileId, setProfileId] = useState([]);
  const[profileData, setProfileData]=useState([]);
  // const [totalBlogs, setTotalBlogs] = useState([]);

  useEffect(() => {
    const getRecentBlogs = async () => {
      const blogRef = collection(db, "blogs");

      // const recentBlogs = query(
      //   blogRef,
      //   orderBy("timestamp", "desc"),
      //   limit(5)
      // );
      const docSnapshot = await getDocs(blogRef);
      setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    getRecentBlogs();
  }, []);
  useEffect(() => {
    // Retrieve the user ID data from the "blogs" collection
    const fetchUserData = async () => {
      try {
        // Access the Firestore collection
        const blogsRef = db.collection('blogs', id);

        // Retrieve all documents from the collection
        const querySnapshot = await blogsRef.get();

        // Extract the user ID data from the documents
        const userData = querySnapshot.docs.map(doc => doc.data().userId);
        setProfileId(userData);
        console.log(userData);
      } catch (error) {
        console.error('Error retrieving user ID data:', error);
      }
    };

    fetchUserData();
  }, []);
// useEffect(()=>{
//   const profileData = async () => {
//     try{
//       const blogsRef = db.collection('users', profileId);
//       const querySnapshot = await blogsRef.get();
//       const profileData = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setProfileData(profileData)
//     }catch (error) {
//       console.error("Error fetching draft data:",);

//       console.log(profileData);
//   }
// };
// if (authUser) {
//   profileData();

// },[profileId])};

  useEffect(() => {
    id && getBlogDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  


  if (loading) {
    return <Spinner />;
  }


  const getBlogDetail = async () => {
    
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const docRef = doc(db, "blogs", id);
    const blogDetail = await getDoc(docRef);
    const blogs = await getDocs(blogRef);
     const tags = [];
    blogs.docs.map((doc) => tags.push(...doc.get("tags")));
  
    const uniqueTags = [...new Set(tags)];
    setTags(uniqueTags);
  
    setBlog(blogDetail.data());
    const relatedBlogsQuery = query(
      blogRef,
      where("tags", "array-contains-any", blogDetail.data().tags)
    );
    setComments(blogDetail.data().comments ? blogDetail.data().comments : []);
    setLikes(blogDetail.data().likes ? blogDetail.data().likes : []);
    const relatedBlogSnapshot = await getDocs(relatedBlogsQuery);
    const relatedBlogs = [];
    relatedBlogSnapshot.forEach((doc) => {
      relatedBlogs.push({ id: doc.id, ...doc.data() });
    });
    setRelatedBlogs(relatedBlogs);
    // setActive(null);
    setLoading(false);

    
  };


  const handleComment = async (e) => {
    e.preventDefault();
    comments.push({
      createdAt: Timestamp.fromDate(new Date()),
      userId,
      name: authUser?.displayName,
      body: userComment,
    });
    toast.success("Comment posted successfully");
    await updateDoc(doc(db, "blogs", id), {
      ...blog,
      comments,
      timestamp: serverTimestamp(),
    });
    setComments(comments);
    setUserComment("");
  };

  // const handleLike = async () => {
  //   if (userId) {
  //     if (blog?.likes) {
  //       const index = likes.findIndex((id) => id === userId);
  //       if (index === -1) {
  //         likes.push(userId);
  //         setLikes([...new Set(likes)]);
  //       } else {
  //          likes = likes.filter((id) => id !== userId);
  //         setLikes(likes);
  //       }
  //     }
  //     await updateDoc(doc(db, "blogs", id), {
  //       ...blog,
  //       likes,
  //       timestamp: serverTimestamp(),
  //     });
  //   }
  // };
  function copyText() {
      
    /* Copy text into clipboard */
    navigator.clipboard.writeText
        // eslint-disable-next-line no-unexpected-multiline
        (url);
        toast.success("Link copied successfully")
}

  const handleLike = async () => {
    if (userId) {
      if (blog?.likes) {
        const index = likes.findIndex((id) => id === userId);
        const updatedLikes = [...likes]; // Create a new array to modify
  
        if (index === -1) {
          updatedLikes.push(userId);
          setLikes([...new Set(updatedLikes)]);
        } else {
          updatedLikes.splice(index, 1);
          setLikes(updatedLikes);
        }
  
        await updateDoc(doc(db, "blogs", id), {
          ...blog,
          likes: updatedLikes,
          timestamp: serverTimestamp(),
        });
      }
    }
  };


  console.log("relatedBlogs", relatedBlogs);
  return (
    <div>
    <div className=" flex dis_block  mt-10 w-screen bg-base-200 ">
      <div className="w-80 flex-1 mob_width h-100 snap-y  overflow-hidden ">
        <div className="  shadow-xl w-full p_5 px-10 mt-10 relative">
          <div className="w-full relative border overflow-hidden m-auto">
            <img width={600} height={200} style={{alignItems:"center"}} src={blog?.imgUrl} alt="" className="hvr-bob m-auto w-100 flex " />
            </div>
          <div className="p_5 relative">
            <h1 className="text-3xl font-bold text-base-400 pb-4">
              {blog?.postTitle}
            </h1>
            <div className="flex gap-5 ">
              <span>
                <p className="text-sm text-danger">
                  -{blog?.timestamp.toDate().toDateString()}
                </p>
              </span>
              <span className="meta-info text-start text-sm text-bg-info">
                <p className="author text-lh-base-400">Publihed by: {blog?.author}</p>
              </span>
            </div>
            <div className="flex flex-col-right gap-10 m-5  ">
            <Like handleLike={handleLike} likes={likes} userId={userId} />
            <div><i className="fas fa-comment"/> {comments?.length}  </div>

            <div className="flex gap-4 m-auto">
              <span>
              Share:
              </span>
        <LinkedinShareButton 
            url={url}
            title={blog?.postTitle}
        >
            <i className="fab fa-linkedin text-sky-500 text-xl"/>
        </LinkedinShareButton>
        <FacebookShareButton 
            url={url}
            title={blog?.postTitle}
        >
            <i className="fab fa-facebook text-sky-500 text-xl"/>
        </FacebookShareButton>
        <TwitterShareButton 
            url={url}
            title={blog?.postTitle}
        >
            <i className="fab fa-twitter text-sky-500 text-xl"/>
        </TwitterShareButton>
        <WhatsappShareButton 
            url={url}
            title={blog?.postTitle}
        >
            <i className="fab fa-whatsapp text-green-500 text-xl"/>
        </WhatsappShareButton>
        <span onClick={copyText}>
          <i className="fas fa-link text-xl"/>
        </span>
    </div>
            </div>
            
            <div className="border mt-5 mb-5">
              {" "}
              <Tags tags={blog?.tags} />
            </div>
            <p className=" text-lg ms-3">{blog?.postDescription}</p>

            <div>
            <ReactMarkdown
            remarkPlugins={[gfm]}
            components={{
              p: ({ children }) => <p style={paragraphStyle}>{children}</p>,
              h1: ({ children }) => <h1 style={heading1}>{children}</h1>,
              h2: ({ children }) => <h2 style={heading2}>{children}</h2>,
              h3: ({ children }) => <h3 style={heading3}>{children}</h3>,
              h4: ({ children }) => <h4 style={heading4}>{children}</h4>,
              h5: ({ children }) => <h5 style={heading5}>{children}</h5>,
              h6: ({ children }) => <h6 style={heading6}>{children}</h6>,
              ol: ({ children }) => <ol style={orderedListStyle}>{children}</ol>,
              ul: ({ children }) => <ul style={unorderedListStyle}>{children}</ul>,
              // img: ({children}) => <img style={imgStyle} src={`${children}`} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    // style={light}
                    {...props}
                    style={atomDark}
                    language={language}                   
                    PreTag="div"
                    children={String(children).replace(/\n$/, "")}
                   
                  />
                ) : (
                  <code {...props}  className={` bg-gray-200 p-4 text-black-900`}>
                    {children}
                  </code> 
                );
              }}}
            children={blog?.content as string} 
            
            className= " break-words p-4 bg-base-100 w-100 text-wrap markdown-body mt-10 mb-10 "

            
        
                
            />
            </div>
            <div className="flex flex-col-right gap-10 w-100 m-5  ">
            <Like handleLike={handleLike} likes={likes} userId={userId} />
            <div><i className="fas fa-comment"/> {comments?.length} Comments </div>
            </div>
            <div className=" bg-slate-950 text-base-200 p-5 mob_width">
              <div className="scroll">
                <h4 className="small-title">{comments?.length} Comment</h4>
                {isEmpty(comments) ? (
                  <UserComment
                    msg={
                      "No Comment yet posted on this blog. Be the first to comment"
                    }
                    name="any"
                    body="any"
                    createdAt="any"
                  />
                ) : (
                  <>
                    {comments?.map((comment) => (
                      <UserComment {...comment} />
                    ))}
                  </>
                )}
              </div>

              <CommentBox
                userId={userId}
                userComment={userComment}
                setUserComment={setUserComment}
                handleComment={handleComment}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{height:"2000px"}} className=" pb-4 pt-4 p-4 bg-slate-800 border-l-base-300 snap-y w-80 mob_width overflow-scroll ">
        <div className="container padding">
          <div className="row mx-0">
            <div className="col-md-3 ">
              <div className="font-bold text-start py-4 w-32 text-white">Tags</div>
              <Tags tags={tags} />
              <FeatureBlogs title={"Recent Blogs"} blogs={blogs} />
              
            </div>
          </div>
          {/* <RelatedBlog id={id} blogs={relatedBlogs} /> */}
        </div>
      </div>
    </div>
    <Trending blogs={blogs}/>
    </div>
  );
};
// export uniqueTags;
export default PostDetail;


