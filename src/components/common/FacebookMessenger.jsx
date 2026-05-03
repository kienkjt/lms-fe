import { useEffect } from "react";

const FACEBOOK_PAGE_ID = "61584898455052";
const FACEBOOK_SDK_ID = "facebook-jssdk";

const FacebookMessenger = () => {
  useEffect(() => {
    if (window.FB || document.getElementById(FACEBOOK_SDK_ID)) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        xfbml: true,
        version: "v18.0",
      });
    };

    const script = document.createElement("script");
    script.id = FACEBOOK_SDK_ID;
    script.src = "https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);
  }, []);

  return (
    <>
      <div id="fb-root" />
      <div
        className="fb-customerchat"
        attribution="setup_tool"
        page_id={FACEBOOK_PAGE_ID}
      />
    </>
  );
};

export default FacebookMessenger;
