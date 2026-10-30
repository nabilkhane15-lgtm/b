import org.gradle.api.tasks.Exec
import org.gradle.api.tasks.Copy

plugins {
    id("com.android.application")
}

android {
    namespace = "com.badmintonclub.fundmanager"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.badmintonclub.fundmanager"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        create("debugConfig") {
            storeFile = file("${rootDir}/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
        create("release") {
            storeFile = file("${rootDir}/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("debugConfig")
        }
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
}

val buildWebBundle = tasks.register<Exec>("buildWebBundle") {
    workingDir = rootDir
    commandLine(
        "sh",
        "-c",
        "[ -x node_modules/.bin/vite ] || npm install --no-audit --no-fund; npm run build; (pgrep -f 'vite.*3000' >/dev/null 2>&1 || nohup ./node_modules/.bin/vite --host 0.0.0.0 --port 3000 >/tmp/vite-dev.log 2>&1 </dev/null &)"
    )
}

val syncWebAssets = tasks.register<Copy>("syncWebAssets") {
    dependsOn(buildWebBundle)
    from("${rootDir}/dist")
    into("${projectDir}/src/main/assets/www")
}

tasks.named("preBuild") {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.core:core-ktx:1.18.0")
}
