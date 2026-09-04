package com.harasees.foodlabel.ui.cameraScreen

import android.content.Context
import android.util.Log
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.harasees.foodlabel.repositories.ClickedPicsRepo
import com.harasees.foodlabel.ui.NavController
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.WhileSubscribed
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject

@HiltViewModel
class CameraScreenVM @Inject constructor(private val clickedPicRepo : ClickedPicsRepo,
                                         private val navController : NavController,
                                         @ApplicationContext private val context : Context) : ViewModel()
{
    val clickedPictures = clickedPicRepo.clickedPictures.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000L),
        listOf()
    )

    val systemPadding = navController.systemPadding

    fun takePhoto(imageCapture : ImageCapture)
    {
        val photoFile = File(
            context.cacheDir,
            "${System.currentTimeMillis()}.jpg"
        )
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        imageCapture.takePicture(
            outputOptions,
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    addPictureEntryToDb(photoFile.absolutePath)
                }
                override fun onError(exc: ImageCaptureException) {
                    Log.e("CameraX", "Capture failed", exc)
                }
            }
        )
    }

    private fun addPictureEntryToDb(picPath : String)
    {
        viewModelScope.launch(Dispatchers.IO) {
            clickedPicRepo.addClickedPicture(picPath)
        }
    }

    fun navBack()
    {
        viewModelScope.launch {
            navController.navTo(NavController.Companion.NavRoutes.GoBack)
        }
    }

    fun openImageViewer()
    {
        viewModelScope.launch {
            val images = withContext(Dispatchers.IO) {
                clickedPicRepo.getAllPictures().mapNotNull {
                    val f = File(it.filePath)
                    if(f.exists())
                        f
                    else
                        null
                }.reversed()
            }
            navController.setImageViewerDlgVisibility(images)
        }
    }
}