package com.harasees.foodlabel

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.rememberLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.harasees.foodlabel.ui.NavController
import com.harasees.foodlabel.ui.theme.FoodLabelTheme
import com.harasees.foodlabel.ui.NavController.Companion.NavRoutes
import com.harasees.foodlabel.ui.cameraScreen.CameraScreen
import com.harasees.foodlabel.ui.homeScreen.HomeScreen
import com.harasees.foodlabel.ui.imageViewerDlg.ImageViewerDlg
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity()
{
    private val vm : MainActivityVM by viewModels()
    override fun onCreate(savedInstanceState : Bundle?)
    {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FoodLabelTheme {
                Scaffold(modifier = Modifier.fillMaxSize(),
                         contentWindowInsets = WindowInsets(top = 0.dp)) { innerPadding ->
                    LaunchedEffect(innerPadding) {
                        vm.navController.setSystemPadding(innerPadding)
                    }
                    FullscreenDialogs()
                    MyNavHost()
                }
            }
        }
    }

    @Composable
    private fun MyNavHost()
    {
        val nvc = rememberNavController()

        val lifecycleOwner = rememberLifecycleOwner()
        LaunchedEffect(Unit) {
            lifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                vm.navController.navChannel.collect {
                    if(it is NavRoutes.GoBack)
                        nvc.popBackStack()
                    else
                        nvc.navigate(it)
                }
            }
        }


        NavHost(nvc,
                startDestination = NavRoutes.HomeScreenRoute)
        {
            composable<NavRoutes.HomeScreenRoute> {
                HomeScreen()
            }

            composable<NavRoutes.CameraScreenRoute> {
                CameraScreen()
            }
        }
    }

    @Composable
    private fun FullscreenDialogs()
    {
        val imageViewer by vm.navController.imageViewerDlg.collectAsState()
        imageViewer?.let {
            ImageViewerDlg(it) {
                vm.navController.setImageViewerDlgVisibility(null)
            }
        }
    }
}
