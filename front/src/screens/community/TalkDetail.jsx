import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 } from "uuid";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import moment from "moment";
import "moment/locale/ko";
import "./TalkDetail.scss";
import dummyProfile from "@images/person.png";
import good from "@images/icon/favorite_black.svg";
import nogood from "@images/icon/favorite_border.svg";
import TalkComment from "@components/community/TalkComment";
import {
  getTalkDetail,
  getTalkProfile,
  talkLike,
  talkDisLike,
  talkDelete,
  isTalkLike,
  getComment,
  writeComment
} from "../../apis/talk";

function TalkDetail() {
  const [talkDetail, setTalkDetail] = useState({ contents: null });
  const userEmail = useSelector(state => state.user.email);
  const userProfile = useSelector(state => state.user.profileImg);
  const userNickname = useSelector(state => state.user.nickname);
  const { id } = useParams();
  const navigate = useNavigate();
  const uploadDay = moment(talkDetail.uploadDate).format("ll");
  const [talkLikeNum, setTalkLikeNum] = useState();
  const [isLiked, setIsLiked] = useState(0);
  const [talkNickname, setTalkNickname] = useState("");
  const [viewNum, setViewNum] = useState(0);
  const [talkProfile, setTalkProfile] = useState();
  const commentRef = useRef();
  const [talkComments, setTalkComments] = useState([]);

  const total = async () => {
    const res = await getTalkDetail(id);
    setTalkLikeNum(res.like);
    setViewNum(res.click);
    setTalkDetail(res);

    const res1 = await isTalkLike({ talkId: id, email: userEmail });
    setIsLiked(res1.isLike);

    const res2 = await getTalkProfile(res.email);
    setTalkNickname(res2.userInfo);
    setTalkProfile(res2.profile);

    const res3 = await getComment(id);
    setTalkComments(res3);
  };
  const toComment = async () => {
    const commentData = await getComment(id);
    setTalkComments(commentData);
  };
  useEffect(() => {
    total();
  }, []);
  const params = {
    talkId: id,
    email: userEmail
  };
  
  const updateTalk = () => {
    navigate(`/board/talk/modi/${id}`);
  };
  const toHome = () => {
    navigate(`/board/talk/home`);
  };
  const deleteParams = {
    talkId: id
  };
  const deleteTalk = async () => {
    const check = window.confirm("????????? ?????????????????????????");
    if (check) {
      try {
        // eslint-disable-next-line
        const res = await talkDelete(deleteParams);
        navigate("/board/talk/home");
      }
      catch {
        navigate("/board/talk/home");
      }
    }
  };
  async function checkTalkLike() {
    const res = await talkLike(params);
    if (res.message === "success") {
      setTalkLikeNum(res.like);
      setIsLiked(1);
    }
  }
  async function noTalkLike() {
    const res = await talkDisLike(params);
    if (res.message === "success") {
      setTalkLikeNum(talkLikeNum - 1);
      setIsLiked(0);
    }
  }

  async function submitComment() {
    if (commentRef.current.value === "") {
      window.alert("?????? ????????? ??????????????????");
    } else {
    const data = {
      email: userEmail,
      depth: 0,
      bundle: -1,
      content: commentRef.current.value
    };
    const res = await writeComment(id, data);
    if (res === "success") {
      const reRes = await getComment(id);
      setTalkComments(reRes);
    }
    commentRef.current.value = "";
  }}
  return (
    <div className="container flex justify-center">
      <div>
        {Object.keys(talkDetail).length !== 0 && (
          <div className="detail flex align-center">
            <div className="detail_thumbnail flex">
              <img src={[talkDetail.blobFile]} alt="????????????" />
            </div>
            <div className="detail_talk">
              <div className="detail_talk_title flex notoBold fs-40">
                {talkDetail.title}
              </div>
              <div className="detail_talk_profile flex">
                <div className="detail_talk_profile_img">
                  {talkProfile !== null && (
                    <img src={talkProfile} alt="??????????????????" />
                  )}
                  {talkProfile === null && (
                    <img src={dummyProfile} alt="??????????????????" />
                  )}
                </div>
                <div className="detail_talk_profile_extra flex">
                  <div className="detail_talk_profile_extra_name notoMid fs-26">
                    {talkDetail.nickname !== "" && <div> {talkNickname} </div>}
                    {talkDetail.nickname === "" && <div>???????????????</div>}
                  </div>
                  <div className="detail_talk_profile_extra_date notoMid fs-18">
                    {uploadDay}
                  </div>
                </div>
              </div>
              <div className="detail_talk_content_box">
                {talkDetail.contents !== null && (
                  <CKEditor
                    editor={InlineEditor}
                    data=""
                    onReady={editor => {
                      editor.setData(talkDetail.contents);
                      editor.enableReadOnlyMode(editor.id);
                    }}
                    config={{
                      toolbar: []
                    }}
                  />
                )}
              </div>
              <div className="detail_talk_tag flex align-center">
                <div className="detail_talk_tag_name notoMid fs-24">
                  {talkDetail.hashtag}
                </div>
                {userNickname !== null && (
                  <div className="detail_talk_tag_good flex align-center justify-center">
                    {isLiked === 0 && (
                      <button
                        type="button"
                        className="detail_talk_tag_good_noLike notoBoldflex flex align-center justify-center"
                        onClick={checkTalkLike}
                      >
                        <img src={good} alt="good" />
                      </button>
                    )}
                    {isLiked === 1 && (
                      <button
                        type="button"
                        className="detail_talk_tag_good_like notoBold fs-18 flex align-center justify-center"
                        onClick={noTalkLike}
                      >
                        <img src={nogood} alt="nogood" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="detail_talk_count flex">
                <div className="detail_talk_count_view flex">
                  <div className="detail_talk_count_view_name notoMid fs-18">
                    ?????????
                  </div>
                  <div className="detail_talk_count_view_num roMid fs-18">
                    {viewNum}
                  </div>
                </div>
                <div className="detail_talk_count_like flex">
                  <div className="detail_talk_count_like_name notoMid fs-18">
                    ?????????
                  </div>
                  <div className="detail_talk_count_like_num roMid fs-18">
                    {talkLikeNum}
                  </div>
                </div>
              </div>
              <div className="divide" />
              <div className="detail_talk_btns flex">
                {userNickname === talkNickname && (
                  <button
                    type="button"
                    className="detail_talk_btns_update notoBold fs-18"
                    onClick={updateTalk}
                  >
                    ??????
                  </button>
                )}
                {userNickname === talkNickname && (
                  <button
                    type="button"
                    className="detail_talk_btns_delete notoBold fs-18"
                    onClick={deleteTalk}
                  >
                    ??????
                  </button>
                )}
                <button
                  type="button"
                  className="detail_talk_btns_home notoBold fs-18"
                  onClick={toHome}
                >
                  ?????????
                </button>
              </div>
              <div className="detail_talk_comment_cnt flex">
                <div className="detail_talk_comment_cnt_text notoBold fs-24">
                  ??????
                </div>
                <div className="detail_talk_comment_cnt_num roMid fs-24">
                  {talkComments.length}
                </div>
              </div>
              {userNickname !== null && (
                <div className="detail_talk_comment_input flex align-center">
                  <div className="detail_talk_comment_input_img">
                    {userProfile !== null && (
                      <img src={userProfile} alt="??????????????????" />
                    )}
                    {userProfile === null && (
                      <img src={dummyProfile} alt="??????????????????" />
                    )}
                  </div>
                  <textarea
                    type="textarea"
                    className="detail_talk_comment_input_text fs-18 notoReg"
                    ref={commentRef}
                  />
                  <div className="detail_talk_comment_input_btn notoBold flex align-center justify-center">
                    <button
                      type="button"
                      className="fs-16"
                      onClick={submitComment}
                    >
                      ??????
                    </button>
                  </div>
                </div>
              )}
              <div className="detail_talk_comment">
                {talkComments.length !== 0 &&
                  talkComments.map(
                    ({
                      depth,
                      bundle,
                      content,
                      uploadDate,
                      profileImg,
                      commentId,
                      nickname,
                      email
                    }) => (
                      <TalkComment
                        toComment={toComment}
                        key={v4()}
                        talkId={id}
                        commentId={commentId}
                        nickname={nickname}
                        depth={depth}
                        bundle={bundle}
                        content={content}
                        uploadDate={uploadDate}
                        profileImg={profileImg}
                        commentEmail={email}
                      />
                    )
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TalkDetail;
