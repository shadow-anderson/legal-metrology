package com.harasees.foodlabel.ui.cameraScreen

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.compose.CameraXViewfinder
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.Preview
import androidx.camera.core.SurfaceRequest
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LocalLifecycleOwner
import coil3.compose.AsyncImage
import com.harasees.foodlabel.R
import com.harasees.foodlabel.ui.NavController

@Composable
fun CameraScreen(vm: CameraScreenVM = hiltViewModel()) {
    val context = LocalContext.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context, Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
    }

    // Ask once when the screen first appears, if not already granted
    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    if (!hasCameraPermission) {
        PermissionRationale(
            onRequestAgain = { permissionLauncher.launch(Manifest.permission.CAMERA) }
        )
        return
    }

    val paddingValues by vm.systemPadding.collectAsState()

    Column(Modifier.padding(paddingValues)) {
        CameraTopBar(vm)
        CameraView(vm)
    }
}

@Composable
fun CameraView(vm : CameraScreenVM)
{
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    val imageCapture = remember { ImageCapture.Builder().build() }
    var surfaceRequest by remember { mutableStateOf<SurfaceRequest?>(null) }

    val preview = remember {
        Preview.Builder().build().apply {
            setSurfaceProvider { request -> surfaceRequest = request }
        }
    }

    LaunchedEffect(Unit) {
        val cameraProvider = ProcessCameraProvider.getInstance(context).get()
        if (!cameraProvider.hasCamera(CameraSelector.DEFAULT_BACK_CAMERA)) {
            // show "no camera available" UI instead of the viewfinder
            return@LaunchedEffect
        }
        cameraProvider.unbindAll()
        cameraProvider.bindToLifecycle(
            lifecycleOwner,
            CameraSelector.DEFAULT_BACK_CAMERA,
            preview,
            imageCapture
        )
    }

    Column(Modifier.fillMaxSize()) {
        surfaceRequest?.let { request ->
            CameraXViewfinder(
                surfaceRequest = request,
                modifier = Modifier.weight(1f)
            )
        }

        Box(
            Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.background)
        ) {
            Button(
                onClick = { vm.takePhoto(imageCapture) },
                modifier = Modifier.padding(32.dp).align(Alignment.Center)
            ) {
                Text("Take photo")
            }
            val clickedPics by vm.clickedPictures.collectAsState()

            clickedPics.lastOrNull()?.let { lastPic ->
                Row(Modifier.wrapContentSize().align(Alignment.CenterEnd)
                        .padding(end = 15.dp),
                    verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        lastPic.filePath,
                        "Picture",
                        modifier = Modifier.size(50.dp).clickable {
                            vm.openImageViewer()
                        },
                        contentScale = ContentScale.Crop
                    )
                    val size = clickedPics.size
                    if (size > 1) Text("+${size - 1}",
                                       modifier = Modifier.padding(start = 2.dp))
                }
            }
        }
    }
}

@Composable
private fun PermissionRationale(onRequestAgain: () -> Unit) {
    Column(
        Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Camera permission is required to take photos.")
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRequestAgain) {
            Text("Grant Permission")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CameraTopBar(vm : CameraScreenVM)
{
    TopAppBar(navigationIcon = {
                  IconButton(onClick = { vm.navBack() }) {
                      Icon(painterResource(R.drawable.arrow_back), "Go back")
                  }
              },
              title = { Text("Camera") },
              actions = {
                  Button(onClick = {  }) {
                      Text("Upload")
                  }
              })
}