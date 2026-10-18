plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "org.turath.salat"
    compileSdk = 36
    defaultConfig {
        applicationId = "org.turath.salat"
        minSdk = 26
        targetSdk = (project.findProperty("tsdk") as String?)?.toInt() ?: 36
        versionCode = (System.getenv("VERSION_CODE") ?: "1").toInt()
        versionName = "1.0." + (System.getenv("VERSION_CODE") ?: "1")
        resourceConfigurations += listOf("en", "ar", "ur")
    }
    signingConfigs {
        // a test key for installing the app directly (APK); the Play Store copy is signed with the owner's own key
        create("test") {
            storeFile = rootProject.file("tools/test-key.jks")
            storePassword = "salat-test"
            keyAlias = "salat"
            keyPassword = "salat-test"
        }
    }
    buildTypes {
        getByName("debug") { signingConfig = signingConfigs.getByName("test") }
        getByName("release") {
            // shrunk (R8): the unused part of the icon library and of Compose is cut away, which is most of the installed size
            isMinifyEnabled = project.findProperty("nomin") == null
            isShrinkResources = project.findProperty("nomin") == null
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            // only for the emulator test (run-as needs a debuggable app); the real release is never debuggable
            isDebuggable = project.findProperty("dbg") != null
            signingConfig = signingConfigs.getByName("test")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
}

// every screen is drawn again after a change of settings (they are read from SharedPreferences, not from Compose state)
composeCompiler { enableStrongSkippingMode = false }

dependencies {
    val bom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(bom)
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    val camerax = "1.4.1"
    implementation("androidx.camera:camera-camera2:$camerax")
    implementation("androidx.camera:camera-lifecycle:$camerax")
    implementation("androidx.camera:camera-view:$camerax")
    testImplementation("junit:junit:4.13.2")
}
