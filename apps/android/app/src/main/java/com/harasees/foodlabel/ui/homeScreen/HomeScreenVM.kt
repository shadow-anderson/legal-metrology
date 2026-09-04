package com.harasees.foodlabel.ui.homeScreen

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.harasees.foodlabel.repositories.ClickedPicsRepo
import com.harasees.foodlabel.ui.NavController
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class HomeScreenVM @Inject constructor(private val navController : NavController,
                                       private val picsRepo : ClickedPicsRepo) : ViewModel()
{
    fun openCamera()
    {
        viewModelScope.launch(Dispatchers.IO) {
            picsRepo.clearClickedPictures()
            withContext(Dispatchers.Main) {
                navController.navTo(NavController.Companion.NavRoutes.CameraScreenRoute)
            }
        }
    }
}