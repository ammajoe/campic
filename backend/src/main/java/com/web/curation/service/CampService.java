package com.web.curation.service;

import com.web.curation.data.dto.ScheduleDto;
import com.web.curation.data.entity.LikedCampList;
import com.web.curation.data.entity.TotalCampList;
import com.web.curation.data.entity.User;
import com.web.curation.data.repository.CampRepository;
import com.web.curation.data.repository.LikedCampRepository;
import com.web.curation.data.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CampService{
    private final CampRepository campRepository;
    private final LikedCampRepository likedCampRepository;
    private final UserRepository userRepository;

    @Autowired
    public CampService(CampRepository campRepository, LikedCampRepository likedCampRepository, UserRepository userRepository) {
        this.campRepository = campRepository;
        this.likedCampRepository = likedCampRepository;
        this.userRepository = userRepository;
    }



    public List<TotalCampList> getAllCamps() {
        return campRepository.findAll();
    }

    public Optional<TotalCampList> findById(int camp_id){
        return campRepository.findById(camp_id);
    }


    /* CREATE */
    @Transactional
    public int save(ScheduleDto.Request dto, int userId, int campId) {
        /* User 정보를 가져와 dto에 담아준다. */
        User user = userRepository.getById(userId); // email로?
        dto.setUserId(user);
        TotalCampList camp = campRepository.getById(campId);
        dto.setCampId(camp);

        LikedCampList likedCampList = dto.toEntity();
        likedCampRepository.save(likedCampList);

        return likedCampList.getSaveId();
    }

}