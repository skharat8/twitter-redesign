import { useQuery } from "@tanstack/react-query";
import { BeatLoader } from "react-spinners";

import { getUserFeed } from "@/services/apiUser";
import UserPost from "@/features/posts/UserPost";

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

function Home() {
  const {
    data: posts,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: getUserFeed,
    staleTime: FIVE_MINUTES_IN_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <div className="flex flex-col items-stretch gap-5">
      {isPending && <BeatLoader color="#b63b63" />}
      {isSuccess && posts.map((post) => <UserPost key={post.id} post={post} />)}
    </div>
  );
}

export default Home;
