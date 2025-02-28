import React, { useEffect, useState } from "react";
import Navbar from "../../components/input/Navbar";
import { data, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import TravelStoryCard from "../../components/Story/TravelStoryCard";
import { ToastContainer, toast } from "react-toastify";
import { MdAdd } from "react-icons/md";
import "react-toastify/ReactToastify.css";
import Modal from "react-modal";
import AddEditTravelStory from "./AddEditTravelStory";
import ViewTravelStory from "./ViewTravelStory";
import EmptyCard from "../../components/Story/EmptyCard";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import FilterInfoTitle from "../../components/Story/FilterInfoTitle";

const Home = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("")

  const [dateRange, setDateRange] = useState({from:null, to:null})

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  //Get User Info
  const getUserInfo = async () => {
    try {
      const reponse = await axiosInstance.get("/get-user");
      if (reponse.data && reponse.data.user) {
        setUserInfo(reponse.data.user);
      }
    } catch (error) {
      if (error.reponse.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };
  const getAllTravelStories = async () => {
    try {
      const reponse = await axiosInstance.get("/get-all-story");
      if (reponse.data && reponse.data.stories) {
        setAllStories(reponse.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred.Please try again");
    }
  };
  //Handle Edit Story Click
  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: data });
  };
  //Handle View Story Click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };
  //Update Favourite Click
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;
    try {
      const response = await axiosInstance.put(
        "/update-is-favourite/" + storyId,
        {
          isFavourite: !storyData.isFavourite,
        }
      );
      if (response.data && response.data.story) {
        toast.success("Story updated Successfully");
        if(filterType === "search" && searchQuery){
          onSearchStory(searchQuery)
        }else if(filterType==='date'){
          filterStoriesByDate(dateRange)
        }else{
          getAllTravelStories();
        }
      }
    } catch (error) {
      console.log("an unexpected error occured.Please try again");
    }
  };
  //Delete
  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-story/" + storyId);
      if (response.data && !response.data.error) {
        toast.error("Story deleted successfully");
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
        getAllTravelStories();
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again");
    }
  };
  //Search Story
  const onSearchStory = async(query)=>{
    try {
      const response = await axiosInstance.get("/search",{
        params:{
          query,
        }
      });
      if(response.data && response.data.stories){
        setFilterType("search")
        setAllStories(response.data.stories)
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again");
    }
  }
  const handleClearSearch =   ()=>{
    setFilterType("")
    getAllTravelStories();
  }

  const filterStoriesByDate = async(day)=>{
    try{
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null
      if(startDate && endDate){
        const response = await axiosInstance.get("/travel-stories/filter",{
          params:{startDate,endDate},
        })
        if(response.data && response.data.stories){
          setFilterType("date")
          setAllStories(response.data.stories)
        }
      }
    }catch(error){
      console.log("An unexpected error occurred. Please try again");
    }
  }

  const handleDayClick=(day)=>{
    setDateRange(day)
    filterStoriesByDate(day)
  }
  const resetFilter=()=>{
    setDateRange({from:null,to:null})
    setFilterType("")
    getAllTravelStories()
  }
  useEffect(() => {
    getUserInfo();
    getAllTravelStories();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto py-18">
        <FilterInfoTitle
        filterType={filterType}
        filterDates={dateRange}
        onClear={()=>{
          resetFilter();
        }}/>

        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard
                      key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      date={item.visitedDate}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavourite}
                      onClick={() => handleViewStory(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard message="Start creating your first travel story!" />
            )}
          </div>
          <div className="w-[350px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker 
                captionLayout = "dropdown-buttons"
                mode="range"
                selected={dateRange}
                onSelect={handleDayClick}
                pagedNavigation/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/**Add & Edit Travel Story Model */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box 
  [&::-webkit-scrollbar]:[width:5px] 
  dark:[&::-webkit-scrollbar-track]:[background-color:rgb(172,201,229)] 
  dark:[&::-webkit-scrollbar-thumb]:[background-color:#057c8e]"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/** VIEW Travel Story Model */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box 
  [&::-webkit-scrollbar]:[width:5px] 
  dark:[&::-webkit-scrollbar-track]:[background-color:rgb(172,201,229)] 
  dark:[&::-webkit-scrollbar-thumb]:[background-color:#057c8e]"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
          }}
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data || null);
          }}
        />
      </Modal>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-300 fixed right-10 bottom-10"
        onClick={() => [
          setOpenAddEditModal({ isShown: true, type: "add", data: null }),
        ]}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <ToastContainer />
    </>
  );
};

export default Home;
