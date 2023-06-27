/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { collection, DocumentData, DocumentSnapshot, getDocs, limit, orderBy, query, startAfter, where,  } from "firebase/firestore";
import { db,  } from "../../firebase/auth";
import Spinner from "../../components/Spinner.js";
import Pagination from "../../components/Pagination.js";
import PostSection from "./PostSection.js";
import Tags from "../../components/Tags.js";
import FeatureBlogs from "../../components/FeatureBlogs";
import Trending from "../../components/Trending.js";
import Category from "../../components/Category.js";
import "../css/postpage.css"
import Search from "../../components/search.js";
import { isEmpty, isNull } from "lodash";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
interface BlogData {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const PostsPage = () => {
  // const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [noOfPages, setNoOfPages] = useState<number | null>(null);
  const [count, setCount] = useState(null);
  const [tags, setTags] = useState([]);
  // const [blog, setBlog] = useState(null);

  const [totalBlogs, setTotalBlogs] = useState([]);
  const [hide, setHide] = useState(false);
  
  

  useEffect(() => {
    getBlogsData();
    getTotalBlogs();
    getPostsData()
    // setSearch("");
    // setActive("blogs");
  }, []);

  if (loading) {
    return <Spinner />;
    
  }
 
  const getPostsData = async () => {
    setLoading(true);
   

    const blogRef = collection(db, "blogs");
    const docSnapshot = await getDocs(blogRef);
    const blogData = docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BlogData[];
    const list = [];
    docSnapshot.docs.forEach((doc) => {
     
      list.push({ id: doc.id, ...doc.data() });
    });
  
   

    const tags = [];
    docSnapshot.docs.map((doc) => tags.push(...doc.get("tags")));
    const uniqueTags = [...new Set(tags)];
    setTags(uniqueTags);
  
    // setBlog(blogs.data());
    
    }

  const getBlogsData = async () => {
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const first = query(blogRef, orderBy("postTitle"), limit(4));
    const docSnapshot = await getDocs(first);
    const blogData = docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BlogData[];
    const list = [];
    docSnapshot.docs.forEach((doc) => {
     
      list.push({ id: doc.id, ...doc.data() });
    });
    setTotalBlogs(list)
    setBlogs(blogData);
    setCount(docSnapshot.size);
    setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
    setLoading(false);
    console.log(list);

   
    // setBlog(blogs.data());
    
    }
  

  const getTotalBlogs = async () => {
    const blogRef = collection(db, "blogs");
    const docSnapshot = await getDocs(blogRef);
    const totalBlogs = docSnapshot.size;
    const totalPage = Math.ceil(totalBlogs / 4);
    setNoOfPages(totalPage);
  };

  const fetchMore = async () => {
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const nextBlogsQuery = query(
      blogRef,
      orderBy("postTitle"),
      startAfter(lastVisible),
      limit(4)
    );
    const nextBlogsSnapshot = await getDocs(nextBlogsQuery);
    const nextBlogData = nextBlogsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BlogData[];
    setBlogs(nextBlogData);
    setCount(nextBlogsSnapshot.size);
    setLastVisible(nextBlogsSnapshot.docs[nextBlogsSnapshot.docs.length - 1]);
    setLoading(false);
  };

  
  if (loading) {
    return <Spinner />;
  }

  const fetchPrev = async () => {
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const end =
      noOfPages !== currentPage ? startAfter(lastVisible) : startAfter(lastVisible);
    const limitData =
      noOfPages !== currentPage
        ? limit(4)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        : count! <= 4 && noOfPages! % 2 === 0
        ? limit(4)
        : limit(4);
    const prevBlogsQuery = query(blogRef, orderBy("postTitle"), end, limitData);
    const prevBlogsSnapshot = await getDocs(prevBlogsQuery);
    const prevBlogData = prevBlogsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BlogData[];
    setBlogs(prevBlogData);
    setCount(prevBlogsSnapshot.size);
    setLastVisible(prevBlogsSnapshot.docs[prevBlogsSnapshot.docs.length - 1]);
    setLoading(false);
  };
  

  const handlePageChange = (value: string) => {
    if (value === "Next") {
      setCurrentPage((page) => page + 1);
      fetchMore();
    } else if (value === "Prev") {
      setCurrentPage((page) => page - 1);
      fetchPrev();
    }
  };
  const counts = totalBlogs.reduce((prevValue, currentValue) => {
    const name = currentValue.category;
    // eslint-disable-next-line no-prototype-builtins
    if (!prevValue.hasOwnProperty(name)) {
      prevValue[name] = 0;
    }
    prevValue[name]++;
    // delete prevValue["undefined"];
    return prevValue;
  }, {});
 
   const categoryCount: { category: string; count: number }[] = Object.keys(counts).map((k) => {
    return {
      category: k,
      count: counts[k],
    };
   
  });
  console.log(categoryCount)
 

  
  return (
    <div className="w-screen bg-slate-800 h-100">
    <div className="flex mt-10  mob_block w-100 ">
  
      <div className=" flex-1  justify-center">
      <div className=" text-left mt-20 text-red-400 bg-slate-950 mob_width text-2xl mx-20 font-bold text_cen p-4 rounded-full mar_top">Explore Posts on Chatter</div>
      {/* <Search search={search} handleChange={handleChange} /> */}

        <ul role="list" className=" divide-y mx-20 divide-slate-300 w-full  mob_width ">
          {blogs?.map((blog) => (
            <li  className=" flex justify-between  align-center w-full " key={blog.id}>
              
              <PostSection content={undefined} postTitle={undefined} postDescription={undefined} imgUrl={undefined} userId={undefined} author={undefined} timestamp={undefined} {...blog} />
            
            </li>
          ))}
        </ul>
        <Pagination
       
          currentPage={currentPage}
          noOfPages={noOfPages}
          handlePageChange={handlePageChange}
        />
      </div>
      <div className=" pb-4 pt-20 p-4 bg-slate-950 w-80 relative mob_width">
        <div className="container padding">
          <div className="row mx-0">
            <div className="col-md-3">
              <div className="font-bold text-start py-4  text-white">Tags</div>
              <Tags tags={tags}  />
              <Category catgBlogsCount={categoryCount} />
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

export default PostsPage;
