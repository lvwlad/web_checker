pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
               script {
                    // Плагин сам соберет образ, используя Docker хоста или агента
                    def customImage = docker.build("my-image-name:${env.BUILD_ID}")
                }
            }
        }
    }
    post {
        success {
            echo "It wokks"
        }
        failure {
            echo "It doesn't work"
        }
    }
}