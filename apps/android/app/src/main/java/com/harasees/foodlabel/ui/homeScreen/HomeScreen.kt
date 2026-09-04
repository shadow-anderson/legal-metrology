package com.harasees.foodlabel.ui.homeScreen

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel


@Composable
fun HomeScreen(vm : HomeScreenVM = hiltViewModel())
{
    Box(Modifier.fillMaxSize())
    {
        Button(onClick = { vm.openCamera() },
               modifier = Modifier.align(Alignment.Center)) {
            Text("Open Camera")
        }
    }
}