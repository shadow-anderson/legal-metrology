package com.harasees.foodlabel

import androidx.lifecycle.ViewModel
import com.harasees.foodlabel.ui.NavController
import dagger.hilt.android.lifecycle.HiltViewModel
import jakarta.inject.Inject

@HiltViewModel
class MainActivityVM @Inject constructor(val navController : NavController) : ViewModel()
{
}