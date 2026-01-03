#include <QApplication>
#include "screens.h"

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    // Style load karna (Master File se)
    QFile styleFile("style.qss");
    styleFile.open(QFile::ReadOnly);
    app.setStyleSheet(styleFile.readAll());

    GamiManager manager; // Ye manager dono screens ko sambhalega
    manager.show();

    return app.exec();
}