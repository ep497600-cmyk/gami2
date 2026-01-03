#include "screens.h"

// Loading Screen ka design
LoadingScreen::LoadingScreen(QWidget *parent) : QWidget(parent) {
    QVBoxLayout *layout = new QVBoxLayout(this);
    QLabel *label = new QLabel("GAMI LOADING...", this);
    label->setObjectName("loading_text");
    layout->addWidget(label, 0, Qt::AlignCenter);
}

// Login Screen ka design
LoginScreen::LoginScreen(QWidget *parent) : QWidget(parent) {
    QVBoxLayout *layout = new QVBoxLayout(this);
    QPushButton *btn = new QPushButton("ENTER GAMI", this);
    btn->setObjectName("login_button");
    layout->addWidget(btn, 0, Qt::AlignCenter);
}

// Manager ka kaam: Screens ko joddna
GamiManager::GamiManager() {
    LoadingScreen *loading = new LoadingScreen(this);
    LoginScreen *login = new LoginScreen(this);

    this->addWidget(loading); // Index 0
    this->addWidget(login);   // Index 1

    // 3 second baad Login screen par jao
    QTimer::singleShot(3000, this, &GamiManager::goToLogin);
}

void GamiManager::goToLogin() {
    this->setCurrentIndex(1); // Screen badal di!
}